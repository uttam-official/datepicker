class MaterialDatePicker {
    constructor(element, inputEl, options = {}) {
        this.element = element;
        this.inputEl = inputEl;
        this.options = options;
        const initDate = options.initDate ? new Date(options.initDate) : new Date();
        this.date = initDate;
        this.selectedDate = new Date(initDate);
        this.view = "days";
        this.minDate = options.minDate ? new Date(options.minDate) : null;
        this.maxDate = options.maxDate ? new Date(options.maxDate) : null;
        this.format = options.format || "d-m-Y";
        const rawType = typeof options.type === "string" ? options.type.toLowerCase() : "";
        this.pickerType = ["date", "datetime", "time"].includes(rawType) ? rawType : "date";
        this.hasDate = this.pickerType !== "time";
        this.hasTime = this.pickerType !== "date";
        const rawTimeMode = typeof options.timeMode === "string" ? options.timeMode : "";
        const rawTimeFormat = options.timeFormat;
        const inferredTimeMode = MaterialDatePicker.inferTimeMode(rawTimeFormat || "HH:mm");
        this.timeMode = rawTimeMode === "12" || rawTimeMode === "24" ? rawTimeMode : inferredTimeMode;
        this.timeFormat = rawTimeFormat || (this.timeMode === "12" ? "hh:mm A" : "HH:mm");
        this.dateTimeSeparator = options.dateTimeSeparator || " ";
        this.timeStepMinutes = Number.isFinite(options.timeStepMinutes)
            ? Math.max(1, Math.min(59, Math.floor(options.timeStepMinutes)))
            : 1;
        this.time = {
            hours: initDate.getHours(),
            minutes: initDate.getMinutes(),
        };
        this.normalizeTimeToStep();
        this.init();
    }

    init() {
        this.render();
        this.attachEvents();
        this.applyInitialTimeValueIfNeeded();
    }

    render() {
        const headerHtml = this.hasDate ? `
                <div class="mdp-header">
                    <div class="mdp-nav mdp-prev">
                    <svg xmlns="http://www.w3.org/2000/svg" width="7.4985" height="12.557" viewBox="0 0 4.999 8.371" fill="white">
                        <path id="angle-left-svgrepo-com" d="M13.75,16.25a.74.74,0,0,1-.53-.22l-3.5-3.5a.75.75,0,0,1,0-1.06L13.22,8a.75.75,0,0,1,1.06,1l-3,3,3,3a.75.75,0,0,1,0,1.06A.74.74,0,0,1,13.75,16.25Z" transform="translate(-9.501 -7.879)"/>
                    </svg>
                    </div>
                    <div class="mdp-title">${this.getHeaderTitle()}</div>
                    <div class="mdp-nav mdp-next">
                    <svg xmlns="http://www.w3.org/2000/svg" width="7.4985" height="12.519" viewBox="0 0 4.999 8.346" fill="white">
                        <path id="angle-right-svgrepo-com" d="M10.25,16.25A.74.74,0,0,1,9.72,16a.75.75,0,0,1,0-1.06l3-3-3-3A.75.75,0,0,1,10.78,8l3.5,3.5a.75.75,0,0,1,0,1.06L10.78,16a.74.74,0,0,1-.53.25Z" transform="translate(-9.501 -7.904)"/>
                    </svg>
                    </div>
                </div>` : "";
        const bodyHtml = this.hasDate ? `<div class="mdp-body">${this.renderBody()}</div>` : "";
        const timeHtml = this.hasTime ? this.renderTime() : "";
        const actionsHtml = this.hasTime ? this.renderActions() : "";
        this.element.innerHTML = `
        <div class="uttam-mdp">
            <div class="mdp-container${this.hasDate ? "" : " mdp-time-only"}">
                ${headerHtml}
                ${bodyHtml}
                ${timeHtml}
                ${actionsHtml}
            </div>
        </div>`;
    }

    getHeaderTitle() {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        if (this.view === "days") return `${months[this.date.getMonth()]} ${this.date.getFullYear()}`;
        if (this.view === "months") return this.date.getFullYear();
        const startYear = Math.floor(this.date.getFullYear() / 12) * 12;
        return `${startYear} - ${startYear + 11}`;
    }

    renderBody() {
        if (!this.hasDate) return "";
        if (this.view === "days") return this.renderDays();
        if (this.view === "months") return this.renderMonths();
        return this.renderYears();
    }

    renderDays() {
        const year = this.date.getFullYear();
        const month = this.date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '<div class="mdp-grid">';
        const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        html += days.map(d => `<div class="mdp-day-header">${d}</div>`).join("");
        for (let i = 0; i < firstDay; i++) html += "<div></div>";
        const selectedDate = MaterialDatePicker.parseDateTimeFromInput(
            this.inputEl.value,
            this.format,
            this.pickerType,
            this.timeFormat,
            this.dateTimeSeparator
        );
        for (let d = 1; d <= daysInMonth; d++) {
            const current = new Date(year, month, d);
            let disabled = false, selected = false, today = false;

            if (this.minDate && current < this.minDate) disabled = true;
            if (this.maxDate && current > this.maxDate) disabled = true;
            // Highlight selected day
            if (selectedDate && current.toDateString() === selectedDate.toDateString()) selected = true;
            if (current.toDateString() === new Date().toDateString()) today = true;
            html += `<div class="mdp-day${disabled ? " disabled" : ""}${selected ? " selected" : ""}${today ? " today" : ""}" data-day="${d}">${d}</div>`;
        }
        html += "</div>";
        return html;
    }

    renderTime() {
        const step = this.timeStepMinutes;
        const hourValues = this.timeMode === "12"
            ? Array.from({ length: 12 }, (_, i) => i + 1)
            : Array.from({ length: 24 }, (_, i) => i);
        const minuteValues = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step)
            .filter(value => value < 60);

        const currentHours = this.time.hours;
        const displayHours = this.timeMode === "12" ? (currentHours % 12 || 12) : currentHours;
        const meridiem = currentHours >= 12 ? "PM" : "AM";

        const hourOptions = hourValues.map(value => {
            const label = String(value).padStart(2, "0");
            const selected = value === displayHours ? " selected" : "";
            return `<option value="${label}"${selected}>${label}</option>`;
        }).join("");

        const minuteOptions = minuteValues.map(value => {
            const label = String(value).padStart(2, "0");
            const selected = value === this.time.minutes ? " selected" : "";
            return `<option value="${label}"${selected}>${label}</option>`;
        }).join("");

        const meridiemSelect = this.timeMode === "12"
            ? `<div class="mdp-time-ampm-group" role="group" aria-label="AM/PM">
                <button type="button" class="mdp-time-ampm${meridiem === "AM" ? " is-active" : ""}" data-value="AM">AM</button>
                <button type="button" class="mdp-time-ampm${meridiem === "PM" ? " is-active" : ""}" data-value="PM">PM</button>
            </div>`
            : "";

        return `<div class="mdp-time">
            <div class="mdp-time-block">
                <select class="mdp-time-field" data-unit="hours" aria-label="Hours">
                    ${hourOptions}
                </select>
                <div class="mdp-time-label">Hour</div>
            </div>
            <div class="mdp-time-colon">:</div>
            <div class="mdp-time-block">
                <select class="mdp-time-field" data-unit="minutes" aria-label="Minutes">
                    ${minuteOptions}
                </select>
                <div class="mdp-time-label">Minute</div>
            </div>
            ${meridiemSelect}
        </div>`;
    }

    renderActions() {
        return `<div class="mdp-actions">
            <button type="button" class="mdp-action mdp-action-close" data-action="close">Close</button>
            <button type="button" class="mdp-action mdp-action-done" data-action="done">Done</button>
        </div>`;
    }

    renderMonths() {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `<div class="mdp-grid mdp-months">
            ${months.map((m, i) => `<div class="mdp-month" data-month="${i}">${m}</div>`).join("")}
        </div>`;
    }

    renderYears() {
        const startYear = Math.floor(this.date.getFullYear() / 12) * 12;
        return `<div class="mdp-grid mdp-years">
            ${Array.from({ length: 12 }, (_, i) => `<div class="mdp-year" data-year="${startYear + i}">${startYear + i}</div>`).join("")}
        </div>`;
    }

    attachEvents() {
        const prev = this.element.querySelector(".mdp-prev");
        const next = this.element.querySelector(".mdp-next");
        const title = this.element.querySelector(".mdp-title");
        const body = this.element.querySelector(".mdp-body");
        const time = this.element.querySelector(".mdp-time");
        const actions = this.element.querySelector(".mdp-actions");

        // Prevent popup closing while navigating
        if (prev) prev.addEventListener("click", e => { e.stopPropagation(); this.navigate(-1); });
        if (next) next.addEventListener("click", e => { e.stopPropagation(); this.navigate(1); });
        if (title) {
            title.addEventListener("click", e => {
                e.stopPropagation();
                // Toggle view hierarchy: days -> months -> years
                this.view = this.view === "days" ? "months" : this.view === "months" ? "years" : "days";
                this.render(); this.attachEvents();
            });
        }

        if (body) {
            body.addEventListener("click", e => {
                e.stopPropagation();
                if (e.target.classList.contains("disabled")) return;

                if (e.target.classList.contains("mdp-day")) {
                    const day = e.target.dataset.day;
                    const selected = new Date(
                        this.date.getFullYear(),
                        this.date.getMonth(),
                        day,
                        this.time.hours,
                        this.time.minutes
                    );
                    this.selectedDate = new Date(selected);
                    this.inputEl.value = this.formatOutput(selected);
                    if (this.pickerType === "date") {
                        this.close();
                    } else {
                        this.render();
                        this.attachEvents();
                    }
                } else if (e.target.classList.contains("mdp-month")) {
                    this.date.setMonth(e.target.dataset.month);
                    this.view = "days";
                    this.render(); this.attachEvents();
                } else if (e.target.classList.contains("mdp-year")) {
                    this.date.setFullYear(e.target.dataset.year);
                    this.view = "months";
                    this.render(); this.attachEvents();
                }
            });
        }

        if (time) {
            time.addEventListener("change", e => {
                if (!e.target.classList.contains("mdp-time-field")) return;
                e.stopPropagation();
                this.handleTimeChange();
            });
            time.addEventListener("click", e => {
                const btn = e.target.closest(".mdp-time-ampm");
                if (!btn) return;
                e.stopPropagation();
                this.handleTimeChange(btn.dataset.value);
            });
        }

        if (actions) {
            actions.addEventListener("click", e => {
                const btn = e.target.closest(".mdp-action");
                if (!btn) return;
                e.stopPropagation();
                if (btn.dataset.action === "done") this.commitSelection();
                this.close();
            });
        }
    }

    navigate(dir) {
        if (this.view === "days") this.date.setMonth(this.date.getMonth() + dir);
        else if (this.view === "months") this.date.setFullYear(this.date.getFullYear() + dir);
        else if (this.view === "years") this.date.setFullYear(this.date.getFullYear() + dir * 12);
        this.render(); this.attachEvents();
    }

    formatDate(d) {
        const dd = String(d.getDate()).padStart(2, "0");
        const dNum = String(d.getDate());
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const mNum = String(d.getMonth() + 1);
        const yyyy = String(d.getFullYear());
        const yy = yyyy.slice(-2);
        return this.format.replace(/YYYY|YY|Y|dd|d|mm|m/g, token => {
            switch (token) {
                case "YYYY":
                case "Y":
                    return yyyy;
                case "YY":
                    return yy;
                case "dd":
                    return dd;
                case "d":
                    return dNum;
                case "mm":
                    return mm;
                case "m":
                    return mNum;
                default:
                    return token;
            }
        });
    }

    formatTime(d) {
        const hours24 = d.getHours();
        const hours12 = hours24 % 12 || 12;
        const hh = String(hours12).padStart(2, "0");
        const h = String(hours12);
        const HH = String(hours24).padStart(2, "0");
        const H = String(hours24);
        const mm = String(d.getMinutes()).padStart(2, "0");
        const m = String(d.getMinutes());
        const A = hours24 >= 12 ? "PM" : "AM";
        const a = A.toLowerCase();
        return this.timeFormat.replace(/HH|H|hh|h|mm|m|A|a/g, token => {
            switch (token) {
                case "HH":
                    return HH;
                case "H":
                    return H;
                case "hh":
                    return hh;
                case "h":
                    return h;
                case "mm":
                    return mm;
                case "m":
                    return m;
                case "A":
                    return A;
                case "a":
                    return a;
                default:
                    return token;
            }
        });
    }

    formatOutput(d) {
        if (this.pickerType === "date") return this.formatDate(d);
        if (this.pickerType === "time") return this.formatTime(d);
        return `${this.formatDate(d)}${this.dateTimeSeparator}${this.formatTime(d)}`.trim();
    }

    updateTimeDisplay() {
        const hoursEl = this.element.querySelector('.mdp-time-field[data-unit="hours"]');
        const minutesEl = this.element.querySelector('.mdp-time-field[data-unit="minutes"]');
        if (hoursEl) {
            const displayHours = this.timeMode === "12" ? (this.time.hours % 12 || 12) : this.time.hours;
            hoursEl.value = String(displayHours).padStart(2, "0");
        }
        if (minutesEl) minutesEl.value = String(this.time.minutes).padStart(2, "0");
        const amBtn = this.element.querySelector('.mdp-time-ampm[data-value="AM"]');
        const pmBtn = this.element.querySelector('.mdp-time-ampm[data-value="PM"]');
        if (amBtn && pmBtn) {
            const meridiem = this.time.hours >= 12 ? "PM" : "AM";
            amBtn.classList.toggle("is-active", meridiem === "AM");
            pmBtn.classList.toggle("is-active", meridiem === "PM");
        }
    }

    normalizeTimeToStep() {
        const step = this.timeStepMinutes;
        if (step <= 1) return;
        const totalMinutes = this.time.hours * 60 + this.time.minutes;
        const rounded = Math.round(totalMinutes / step) * step;
        const mod = ((rounded % 1440) + 1440) % 1440;
        this.time.hours = Math.floor(mod / 60);
        this.time.minutes = mod % 60;
    }

    handleTimeChange(meridiemOverride) {
        const hoursEl = this.element.querySelector('.mdp-time-field[data-unit="hours"]');
        const minutesEl = this.element.querySelector('.mdp-time-field[data-unit="minutes"]');
        if (!hoursEl || !minutesEl) return;
        const hoursValue = parseInt(hoursEl.value, 10);
        const minutesValue = parseInt(minutesEl.value, 10);
        if (Number.isNaN(hoursValue) || Number.isNaN(minutesValue)) return;

        let hours = hoursValue;
        if (this.timeMode === "12") {
            const meridiem = meridiemOverride || (this.time.hours >= 12 ? "PM" : "AM");
            if (hours === 12) {
                hours = meridiem === "AM" ? 0 : 12;
            } else if (meridiem === "PM") {
                hours += 12;
            }
        }

        this.time.hours = hours;
        this.time.minutes = minutesValue;
        this.syncTimeToInput();
        this.updateTimeDisplay();
    }

    syncTimeToInput() {
        if (!this.hasTime) return;
        const base = this.selectedDate ? new Date(this.selectedDate) : new Date(this.date);
        base.setHours(this.time.hours, this.time.minutes, 0, 0);
        this.selectedDate = new Date(base);
        this.inputEl.value = this.formatOutput(base);
    }

    commitSelection() {
        const base = this.selectedDate ? new Date(this.selectedDate) : new Date(this.date);
        if (this.hasTime) base.setHours(this.time.hours, this.time.minutes, 0, 0);
        this.selectedDate = new Date(base);
        this.inputEl.value = this.formatOutput(base);
    }

    applyInitialTimeValueIfNeeded() {
        if (this.pickerType !== "time") return;
        if (this.inputEl.value) return;
        const base = new Date(this.date);
        base.setHours(this.time.hours, this.time.minutes, 0, 0);
        this.selectedDate = new Date(base);
        this.inputEl.value = this.formatOutput(base);
    }

    static parseDateFromFormat(value, format) {
        if (!value || !format) return null;

        const tokens = ["YYYY", "YY", "Y", "dd", "d", "mm", "m"];
        const tokenPatterns = {
            YYYY: "(\\d{4})",
            YY: "(\\d{2})",
            Y: "(\\d{4})",
            dd: "(\\d{2})",
            d: "(\\d{1,2})",
            mm: "(\\d{2})",
            m: "(\\d{1,2})",
        };

        let regexStr = "";
        const order = [];
        for (let i = 0; i < format.length;) {
            let matched = null;
            for (const token of tokens) {
                if (format.startsWith(token, i)) {
                    matched = token;
                    break;
                }
            }

            if (matched) {
                regexStr += tokenPatterns[matched];
                order.push(matched);
                i += matched.length;
            } else {
                const ch = format[i];
                regexStr += ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                i += 1;
            }
        }

        const match = value.match(new RegExp(`^${regexStr}$`));
        if (!match) return null;

        let day;
        let month;
        let year;
        order.forEach((token, idx) => {
            const part = parseInt(match[idx + 1], 10);
            if (token === "d" || token === "dd") day = part;
            if (token === "m" || token === "mm") month = part;
            if (token === "Y" || token === "YYYY") year = part;
            if (token === "YY") year = 2000 + part;
        });

        if (!day || !month || !year) return null;
        const dateObj = new Date(year, month - 1, day);
        if (
            Number.isNaN(dateObj.getTime()) ||
            dateObj.getFullYear() !== year ||
            dateObj.getMonth() !== month - 1 ||
            dateObj.getDate() !== day
        ) {
            return null;
        }

        return dateObj;
    }

    static swapDayMonthFormat(format) {
        if (!format) return null;
        const tokens = ["YYYY", "YY", "Y", "dd", "d", "mm", "m"];
        let swapped = "";
        let changed = false;
        for (let i = 0; i < format.length;) {
            let matched = null;
            for (const token of tokens) {
                if (format.startsWith(token, i)) {
                    matched = token;
                    break;
                }
            }
            if (matched) {
                if (matched === "d") {
                    swapped += "m";
                    changed = true;
                } else if (matched === "dd") {
                    swapped += "mm";
                    changed = true;
                } else if (matched === "m") {
                    swapped += "d";
                    changed = true;
                } else if (matched === "mm") {
                    swapped += "dd";
                    changed = true;
                } else {
                    swapped += matched;
                }
                i += matched.length;
            } else {
                swapped += format[i];
                i += 1;
            }
        }
        return changed ? swapped : null;
    }

    static parseDateFromFormatWithSwap(value, format) {
        const parsed = MaterialDatePicker.parseDateFromFormat(value, format);
        if (parsed) return parsed;
        const swapped = MaterialDatePicker.swapDayMonthFormat(format);
        if (!swapped || swapped === format) return null;
        return MaterialDatePicker.parseDateFromFormat(value, swapped);
    }

    static inferDateFormatsFromValue(value) {
        if (!value) return [];
        let sep = null;
        if (value.includes("-")) sep = "-";
        else if (value.includes("/")) sep = "/";
        if (!sep) return [];
        return [
            `d${sep}m${sep}Y`,
            `m${sep}d${sep}Y`,
            `Y${sep}m${sep}d`,
        ];
    }

    static parseDateWithFallback(value, format) {
        const parsed = MaterialDatePicker.parseDateFromFormatWithSwap(value, format);
        if (parsed) return parsed;
        const fallbackFormats = MaterialDatePicker.inferDateFormatsFromValue(value);
        for (const candidate of fallbackFormats) {
            const fallback = MaterialDatePicker.parseDateFromFormat(value, candidate);
            if (fallback) return fallback;
        }
        return null;
    }

    static parseTimeFromFormat(value, format) {
        if (!value || !format) return null;

        const tokens = ["HH", "H", "hh", "h", "mm", "m", "A", "a"];
        const tokenPatterns = {
            HH: "(\\d{2})",
            H: "(\\d{1,2})",
            hh: "(\\d{2})",
            h: "(\\d{1,2})",
            mm: "(\\d{2})",
            m: "(\\d{1,2})",
            A: "(AM|PM)",
            a: "(am|pm)",
        };

        let regexStr = "";
        const order = [];
        for (let i = 0; i < format.length;) {
            let matched = null;
            for (const token of tokens) {
                if (format.startsWith(token, i)) {
                    matched = token;
                    break;
                }
            }

            if (matched) {
                regexStr += tokenPatterns[matched];
                order.push(matched);
                i += matched.length;
            } else {
                const ch = format[i];
                regexStr += ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                i += 1;
            }
        }

        const match = value.match(new RegExp(`^${regexStr}$`));
        if (!match) return null;

        let hours;
        let minutes = 0;
        let is12Hour = false;
        let meridiem = null;
        order.forEach((token, idx) => {
            const part = match[idx + 1];
            const num = parseInt(part, 10);
            if (token === "HH" || token === "H") hours = num;
            if (token === "hh" || token === "h") {
                hours = num;
                is12Hour = true;
            }
            if (token === "mm" || token === "m") minutes = num;
            if (token === "A" || token === "a") meridiem = part.toUpperCase();
        });

        if (hours == null || minutes == null) return null;
        if (is12Hour) {
            if (hours < 1 || hours > 12) return null;
            if (meridiem === "PM" && hours < 12) hours += 12;
            if (meridiem === "AM" && hours === 12) hours = 0;
        }
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

        return { hours, minutes };
    }

    static inferTimeFormatFromValue(value) {
        if (!value) return "HH:mm";
        return /am|pm/i.test(value) ? "hh:mm A" : "HH:mm";
    }

    static inferTimeMode(format) {
        if (!format) return "24";
        if (format.includes("h") || format.includes("A") || format.includes("a")) return "12";
        return "24";
    }

    static parseDateTimeFromInput(value, dateFormat, type, timeFormat, separator) {
        if (!value) return null;
        if (type === "date") return MaterialDatePicker.parseDateWithFallback(value, dateFormat);
        if (type === "time") {
            let time = MaterialDatePicker.parseTimeFromFormat(value, timeFormat);
            if (!time) {
                const inferredTimeFormat = MaterialDatePicker.inferTimeFormatFromValue(value);
                if (inferredTimeFormat !== timeFormat) {
                    time = MaterialDatePicker.parseTimeFromFormat(value, inferredTimeFormat);
                }
            }
            if (!time) return null;
            const dateObj = new Date();
            dateObj.setHours(time.hours, time.minutes, 0, 0);
            return dateObj;
        }

        const sep = separator == null ? " " : separator;
        const candidates = [];
        if (sep && value.includes(sep)) {
            const lastIdx = value.lastIndexOf(sep);
            candidates.push({
                datePart: value.slice(0, lastIdx),
                timePart: value.slice(lastIdx + sep.length),
            });
            if (sep === " ") {
                const firstIdx = value.indexOf(sep);
                if (firstIdx !== lastIdx) {
                    candidates.push({
                        datePart: value.slice(0, firstIdx),
                        timePart: value.slice(firstIdx + sep.length),
                    });
                }
            }
        } else {
            candidates.push({ datePart: value, timePart: "" });
        }

        for (const candidate of candidates) {
            const dateObj = MaterialDatePicker.parseDateWithFallback(candidate.datePart.trim(), dateFormat);
            if (!dateObj) continue;
            const timeRaw = candidate.timePart.trim();
            let time = timeRaw ? MaterialDatePicker.parseTimeFromFormat(timeRaw, timeFormat) : null;
            if (!time && timeRaw) {
                const inferredTimeFormat = MaterialDatePicker.inferTimeFormatFromValue(timeRaw);
                if (inferredTimeFormat !== timeFormat) {
                    time = MaterialDatePicker.parseTimeFromFormat(timeRaw, inferredTimeFormat);
                }
            }
            if (time) dateObj.setHours(time.hours, time.minutes, 0, 0);
            return dateObj;
        }

        return null;
    }

    close() {
        this.element.style.display = "none";
    }
}


export function initDatepicker(selector = ".datepicker", options = {}) {
    const popup = document.createElement("div");
    popup.id = "uttam-mdp-popup";
    popup.style.position = "absolute";
    popup.style.zIndex = "9999";
    popup.style.display = "none";
    document.body.appendChild(popup);

    document.querySelectorAll(selector).forEach(input => {
        input.addEventListener("focus", e => {
            const rect = input.getBoundingClientRect();
            popup.style.display = "block";

            // Render once to measure height
            popup.innerHTML = "";
            new MaterialDatePicker(popup, input, options);
            const popupHeight = popup.offsetHeight || 350; // fallback height
            popup.style.display = "none";

            // Calculate available space
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Decide popup vertical position
            let top;
            if (spaceBelow < popupHeight && spaceAbove > popupHeight) {
                // Show above
                top = rect.top + window.scrollY - popupHeight - 8;
            } else {
                // Show below
                top = rect.bottom + window.scrollY + 5;
            }

            // Show popup now
            popup.style.display = "block";
            popup.style.top = top + "px";
            popup.style.left = rect.left + "px";

            // Ensure popup stays inside the viewport horizontally
            const popupRect = popup.getBoundingClientRect();
            if (popupRect.right > window.innerWidth) {
                popup.style.left = (window.innerWidth - popupRect.width - 10) + "px";
            } else if (popupRect.left < 0) {
                popup.style.left = "10px";
            }

            // Determine initial date from input value (if valid)
            let initDate = new Date();
            const format = options.format || "d-m-Y";
            const rawType = typeof options.type === "string" ? options.type.toLowerCase() : "";
            const type = ["date", "datetime", "time"].includes(rawType) ? rawType : "date";
            const timeFormat = options.timeFormat || "HH:mm";
            const dateTimeSeparator = options.dateTimeSeparator || " ";
            const parsed = MaterialDatePicker.parseDateTimeFromInput(
                input.value,
                format,
                type,
                timeFormat,
                dateTimeSeparator
            );
            if (parsed) initDate = parsed;

            new MaterialDatePicker(popup, input, { ...options, initDate });
        });
    });

    document.addEventListener("click", e => {
        if (!popup.contains(e.target) && !e.target.matches(selector)) {
            popup.style.display = "none";
        }
    });
}

if (typeof window !== "undefined") window.initDatepicker = initDatepicker;
