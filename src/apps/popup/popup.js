import * as SimpleSwitch from "a-simple-switch";

import { config } from "./config";
import moment from "moment";
import { updateThemePostMessage } from "./utils";

import { changeTheme, storage } from "../common";

import "a-simple-switch/src/sass/SimpleSwitch.scss";
import "./styles";
import "bootstrap/scss/bootstrap.scss";
import "../common/styles";

export const setupPopup = () => {
  const updateBirthdayPostMessage = () => {
    storage.get("birthday", (birthday) => {
      browser.runtime.sendMessage(
        {
          type: "UPDATE_BIRTHDAY",
          payload: {
            birthday,
          },
        },
        () => {},
      );
    });
  };

  const updateBirthdayDate = (date) => {
    storage.get("birthdayTime", (birthdayTime) => {
      storage.set("birthdayDate", date);
      if (!birthdayTime)
        storage.set("birthday", date, updateBirthdayPostMessage);
      else
        storage.set(
          "birthday",
          date + " " + birthdayTime,
          updateBirthdayPostMessage,
        );
    });
  };

  const updateBirthdayTime = (time) => {
    storage.get("birthdayDate", (birthdayDate) => {
      storage.set("birthdayTime", time);
      if (!birthdayDate)
        storage.set("birthday", time, updateBirthdayPostMessage);
      else
        storage.set(
          "birthday",
          birthdayDate + " " + time,
          updateBirthdayPostMessage,
        );
    });
  };

  const setupActualAge = (initialValue) => {
    const birthdayDate = document.getElementById("date");
    const birthdayTime = document.getElementById("time");

    if (initialValue) {
      if (moment(initialValue).format("YYYY-MM-DD") !== config.INVALID_DATE)
        birthdayDate.value = moment(initialValue).format("YYYY-MM-DD");
      if (moment(initialValue).format("HH:mm") !== config.INVALID_DATE) {
        birthdayTime.value = moment(initialValue).format("HH:mm");
      }
    }

    birthdayDate.addEventListener("change", (event) => {
      updateBirthdayDate(moment(event.target.value).format("YYYY-MM-DD"));
    });

    birthdayTime.addEventListener("change", (event) => {
      updateBirthdayTime(event.target.value);
    });
  };

  const restoreActualAge = async () => {
    await storage.get("birthday", setupActualAge);

    SimpleSwitch.init();

    const dark = document.getElementById("dark");
    const light = document.getElementById("light");
    const switcher = document.getElementById("theme-switch");
    const shadowSwitcher = document.getElementsByClassName(
      "_simple-switch-track",
    )[0];

    let currentTheme = "light";

    storage.get("theme", (theme) => {
      changeTheme(theme);
      currentTheme = theme;
      if (theme === "dark") {
        switcher.checked = true;
        light.classList.add("hidden");
        dark.classList.remove("hidden");
        shadowSwitcher.classList.add("on");
      }
    });

    switcher.addEventListener("change", (event) => {
      if (event.target.checked) {
        currentTheme = "dark";
        light.classList.add("hidden");
        dark.classList.remove("hidden");
      } else {
        currentTheme = "light";
        dark.classList.add("hidden");
        light.classList.remove("hidden");
      }
      changeTheme(currentTheme);
      storage.set("theme", currentTheme);
      updateThemePostMessage();
    });
  };

  document.addEventListener("DOMContentLoaded", restoreActualAge);
};

setupPopup();
