class MaterialDatePicker {
    constructor(element, inputEl, options = {}) {
        this.element = element;
        this.inputEl = inputEl;
        this.options = options;
        this.date = options.initDate ? new Date(options.initDate) : new Date();
        this.view = "days";
        this.minDate = options.minDate ? new Date(options.minDate) : null;
        this.maxDate = options.maxDate ? new Date(options.maxDate) : null;
        this.format = options.format || "d-m-Y";
        this.init();
    }

    init() {
        this.render();
        this.attachEvents();
    }

    render() {
        this.element.innerHTML = `
        <div class="uttam-mdp">
            <div class="mdp-container">
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
                </div>
                <div class="mdp-body">${this.renderBody()}</div>
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
        const selectedDate = this.inputEl.value ? new Date(this.inputEl.value.split(/[-\/]/).reverse().join('-')) : null;
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

        // Prevent popup closing while navigating
        prev.addEventListener("click", e => { e.stopPropagation(); this.navigate(-1); });
        next.addEventListener("click", e => { e.stopPropagation(); this.navigate(1); });
        title.addEventListener("click", e => {
            e.stopPropagation();
            // Toggle view hierarchy: days -> months -> years
            this.view = this.view === "days" ? "months" : this.view === "months" ? "years" : "days";
            this.render(); this.attachEvents();
        });

        body.addEventListener("click", e => {
            e.stopPropagation();
            if (e.target.classList.contains("disabled")) return;

            if (e.target.classList.contains("mdp-day")) {
                const day = e.target.dataset.day;
                const selected = new Date(this.date.getFullYear(), this.date.getMonth(), day);
                this.inputEl.value = this.formatDate(selected);
                this.close();
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

    navigate(dir) {
        if (this.view === "days") this.date.setMonth(this.date.getMonth() + dir);
        else if (this.view === "months") this.date.setFullYear(this.date.getFullYear() + dir);
        else if (this.view === "years") this.date.setFullYear(this.date.getFullYear() + dir * 12);
        this.render(); this.attachEvents();
    }

    formatDate(d) {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return this.format.replace("d", dd).replace("m", mm).replace("Y", yyyy);
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
            popup.style.top = rect.bottom + window.scrollY + "px";
            popup.style.left = rect.left + "px";

            // Determine initial date
            let initDate = new Date();
            if (input.value) {
                const parts = input.value.split(/[-\/]/); // supports d-m-Y or d/m/Y
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    const dateObj = new Date(year, month, day);
                    if (!isNaN(dateObj)) initDate = dateObj;
                }
            }

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
