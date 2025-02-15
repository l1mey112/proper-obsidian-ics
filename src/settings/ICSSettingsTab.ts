import ICSPlugin from "../main";
import {
  PluginSettingTab,
  Setting,
  App,
  ButtonComponent,
  Modal,
  TextComponent,
  DropdownComponent,
} from "obsidian";

import {
  Calendar,
  DEFAULT_CALENDAR_FORMAT
} from "./ICSSettings";
import moment = require("moment");

export function getCalendarElement(
  icsName: string): HTMLElement {
  let calendarElement, titleEl;

  calendarElement = createDiv({
    cls: `calendar calendar-${icsName}`,
  });
  titleEl = calendarElement.createEl("summary", {
    cls: `calendar-name ${icsName}`,
    text: icsName
  });

  return calendarElement;
}

export default class ICSSettingsTab extends PluginSettingTab {
  plugin: ICSPlugin;
  timeFormatExample = document.createElement('b');

  constructor(app: App, plugin: ICSPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let {
      containerEl
    } = this;

    containerEl.empty();

    const calendarContainer = containerEl.createDiv(
      "ics-setting-calendar"
    );

    const calnedarSetting = new Setting(calendarContainer)
      .setHeading().setName("Calendars");

    new Setting(calendarContainer)
      .setName("Add new")
      .setDesc("Add a new calendar")
      .addButton((button: ButtonComponent): ButtonComponent => {
        let b = button
          .setTooltip("Add Additional")
          .setButtonText("+")
          .onClick(async () => {
            let modal = new SettingsModal(this.app, this.plugin);

            modal.onClose = async () => {
              if (modal.saved) {
                this.plugin.addCalendar({
                  icsName: modal.icsName,
                  icsUrl: modal.icsUrl,
                  ownerEmail: modal.ownerEmail,
                  calendarType: modal.calendarType as 'remote' | 'vdir',
                  folder: modal.folder,
                  tags: modal.tags,
                  linkIgnores: modal.linkIgnores,
                  linkClassRegex: modal.linkClassRegex,
                  placeIgnores: modal.placeIgnores,
                });
                this.display();
              }
            };

            modal.open();
          });

        return b;
      });

    const additional = calendarContainer.createDiv("calendar");

    const sortedCalendarKeys = Object.keys(this.plugin.data.calendars).sort();
    for (let calendarKey of sortedCalendarKeys) {
      const calendar = this.plugin.data.calendars[calendarKey];
      let setting = new Setting(additional);

      let calEl = getCalendarElement(
        calendar.icsName);
      setting.infoEl.replaceWith(calEl);

      setting
        .addExtraButton((b) => {
          b.setIcon("pencil")
            .setTooltip("Edit")
            .onClick(() => {
              let modal = new SettingsModal(this.app, this.plugin, calendar);

              modal.onClose = async () => {
                if (modal.saved) {
                  this.plugin.removeCalendar(calendar);
                  this.plugin.addCalendar({
                    icsName: modal.icsName,
                    icsUrl: modal.icsUrl,
                    ownerEmail: modal.ownerEmail,
                    calendarType: modal.calendarType as 'remote' | 'vdir',
                    folder: modal.folder,
                    tags: modal.tags,
                    linkIgnores: modal.linkIgnores,
                    linkClassRegex: modal.linkClassRegex,
                    placeIgnores: modal.placeIgnores,
                  });
                  this.display();
                }
              };

              modal.open();
            });
        })
        .addExtraButton((b) => {
          b.setIcon("trash")
            .setTooltip("Delete")
            .onClick(() => {
              this.plugin.removeCalendar(calendar);
              this.display();
            });
        });
    }

  }

}


class SettingsModal extends Modal {
  plugin: ICSPlugin;
  icsName: string = "";
  icsUrl: string = "";
  urlSetting: Setting;
  urlText: TextComponent;
  urlDropdown: DropdownComponent;
  ownerEmail: string = "";
  folder: string = "";
  tags: string = "";
  linkIgnores: string = "";
  linkClassRegex: string = "";
  placeIgnores: string = "";

  saved: boolean = false;
  error: boolean = false;
  private hasChanges: boolean = false;

  calendarType: string;
  constructor(app: App, plugin: ICSPlugin, setting?: Calendar) {
    super(app);
    this.plugin = plugin;
    if (setting) {
      this.icsName = setting.icsName;
      this.icsUrl = setting.icsUrl;
      this.ownerEmail = setting.ownerEmail;
      this.calendarType = setting.calendarType || 'remote';
      this.folder = setting.folder;
      this.tags = setting.tags;
      this.linkIgnores = setting.linkIgnores;
      this.linkClassRegex = setting.linkClassRegex;
      this.placeIgnores = setting.placeIgnores;
    }
  }

  listIcsDirectories(): string[] {
    const icsFiles = this.app.vault.getFiles().filter(f => f.extension === "ics");
    const directories = new Set(icsFiles.map(f => f.parent.path));
    return Array.from(directories);
  }

  display() {
    let {
      contentEl
    } = this;

    contentEl.empty();

    const settingDiv = contentEl.createDiv({ cls: 'ics-settings' });

    let nameText: TextComponent;
    const nameSetting = new Setting(settingDiv)
      .setName("Calendar Name")
      .addText((text) => {
        nameText = text;
        nameText.setValue(this.icsName).onChange(async (v) => {
          this.icsName = v;
          this.hasChanges = true;
        });
      });

    const ownerEmailSetting = new Setting(settingDiv)
      .setName('Calendar Owner Email (Optional)')
      .setDesc('Used to skip declined events')
      .addText(text => {
        text.setValue(this.ownerEmail).onChange(value => {
          this.ownerEmail = value;
          this.hasChanges = true;
        });
      });
    
    const folderSetting = new Setting(settingDiv)
      .setName('Folder')
      .setDesc('Where generated notes will be stored.')
      .addText(text => {
        text.setValue(this.folder).onChange(value => {
          this.folder = value;
          this.hasChanges = true;
        });
      });

    const tagsSetting = new Setting(settingDiv)
      .setName('Tags')
      .setDesc('Tags to be added to generated notes, comma separated.')
      .addText(text => {
        text.setValue(this.tags).onChange(value => {
          this.tags = value;
          this.hasChanges = true;
        });
      });

    const linkIgnoresSetting = new Setting(settingDiv)
      .setName('Link Ignores')
      .setDesc('Text that will not be converted to a link, comma separated.')
      .addText(text => {
        text.setValue(this.linkIgnores).onChange(value => {
          this.linkIgnores = value;
          this.hasChanges = true;
        })
      });

    const placeIgnoresSetting = new Setting(settingDiv)
      .setName('Place Ignores')
      .setDesc('Text that will not be shown on the title, comma separated. Similar to Link Ignores.')
      .addText(text => {
        text.setValue(this.placeIgnores).onChange(value => {
          this.placeIgnores = value;
          this.hasChanges = true;
        })
      });

    const linkClassRegexSetting = new Setting(settingDiv)
      .setName('Link Class Regex')
      .setDesc('Regex to convert text to a link.')
      .addText(text => {
        text.setValue(this.linkClassRegex).onChange(value => {
          this.linkClassRegex = value;
          this.hasChanges = true;
        })
      });

    const calendarTypeSetting = new Setting(settingDiv)
      .setName('Calendar Type')
      .setDesc('Select the type of calendar (Remote URL or vdir)')
      .addDropdown(dropdown => {
        dropdown.addOption('remote', 'Remote URL');
        dropdown.addOption('vdir', 'vdir');
        dropdown.setValue(this.calendarType)
          .onChange(value => {
            this.calendarType = value as 'remote' | 'vdir';
            updateUrlSetting();
          });
      });

    const urlSettingDiv = settingDiv.createDiv({ cls: 'url-setting-container' });

    // Function to update URL setting
    const updateUrlSetting = () => {
      // First, remove the existing URL setting if it exists
      settingDiv.querySelectorAll('.url-setting').forEach(el => el.remove());

      let urlSetting = new Setting(urlSettingDiv)
        .setName(this.calendarType === 'vdir' ? 'Directory' : 'Calendar URL');
      urlSetting.settingEl.addClass('url-setting');

      if (this.calendarType === 'vdir') {
        // If vdir, add a dropdown
        urlSetting.addDropdown(dropdown => {
          const directories = this.listIcsDirectories();
          directories.forEach(dir => {
            dropdown.addOption(dir, dir);
          });
          dropdown.setValue(this.icsUrl).onChange(value => {
            this.icsUrl = value;
            this.hasChanges = true;
          });
        });
      } else {
        // If remote, add a text input
        urlSetting.addText(text => {
          text.setValue(this.icsUrl).onChange(value => {
            this.icsUrl = value;
            this.hasChanges = true
          });
        });
      }
    };

    // Call updateUrlSetting initially
    updateUrlSetting();

    let footerEl = contentEl.createDiv();
    let footerButtons = new Setting(footerEl);
    footerButtons.addButton((b) => {
      b.setTooltip("Save")
        .setIcon("save")
        .onClick(async () => {
          await this.plugin.saveSettings();
          this.saved = true;
          this.hasChanges = false;
          this.close();
        });
      return b;
    });
    footerButtons.addExtraButton((b) => {
      b.setTooltip("Cancel")
        .setIcon("cross")
        .onClick(() => {
          this.saved = false;
          this.close();
        });
      return b;
    });
  }

  onOpen() {
    this.display();
  }

  close() {
    if (this.hasChanges) {
      const confirmDiscard = confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmDiscard) {
        return; // Prevent the modal from closing
      }
      this.plugin.loadSettings();
    }
    super.close();
  }

  static setValidationError(textInput: TextComponent, message?: string) {
    textInput.inputEl.addClass("is-invalid");
    if (message) {
      textInput.inputEl.parentElement.addClasses([
        "has-invalid-message",
        "unset-align-items"
      ]);
      textInput.inputEl.parentElement.parentElement.addClass(
        ".unset-align-items"
      );
      let mDiv = textInput.inputEl.parentElement.querySelector(
        ".invalid-feedback"
      ) as HTMLDivElement;

      if (!mDiv) {
        mDiv = createDiv({
          cls: "invalid-feedback"
        });
      }
      mDiv.innerText = message;
      mDiv.insertAfter(textInput.inputEl, null);
    }
  }
  static removeValidationError(textInput: TextComponent) {
    textInput.inputEl.removeClass("is-invalid");
    textInput.inputEl.parentElement.removeClasses([
      "has-invalid-message",
      "unset-align-items"
    ]);
    textInput.inputEl.parentElement.parentElement.removeClass(
      ".unset-align-items"
    );

    if (textInput.inputEl.parentElement.children[1]) {
      textInput.inputEl.parentElement.removeChild(
        textInput.inputEl.parentElement.children[1]
      );
    }
  }
}
