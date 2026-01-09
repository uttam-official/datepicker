# 🟣 @uttam-official/datepicker

A lightweight, elegant, **Material-style Datepicker** for modern web apps - built with vanilla JavaScript and CSS.  
Supports **date**, **datetime**, and **time** modes, **min/max date**, **custom date/time formats**, and **text field binding** out of the box.

---

## 🚀 Features

- 🎨 Clean Material-inspired design  
- 📅 Click-to-open popup datepicker  
- 🧭 Month & Year navigation with smooth transitions  
- 🧭 Date, DateTime, and Time picker types  
- 🧭 12h/24h time support with AM/PM toggle  
- 🔒 Min/Max date restrictions  
- 🕒 Custom date format (e.g., `d-m-Y`, `m/d/Y`, etc.)  
- 🧩 Easily attach to any text input  
- ⚡ Lightweight — no dependencies, no jQuery required  
- 🌐 Works in all modern browsers

---

## 📦 Installation

```bash
npm install @uttam-official/datepicker
# or
yarn add @uttam-official/datepicker
```

---

## 🧠 Usage

### 1️⃣ Import JS and CSS
```html
<link rel="stylesheet" href="node_modules/@uttam-official/datepicker/dist/uttam-material-datepicker.css">
<script src="node_modules/@uttam-official/datepicker/dist/uttam-material-datepicker.min.js"></script>
```

### 2️⃣ Add input field
```html
<input type="text" class="datepicker" placeholder="Select date">
```

### 3️⃣ Initialize the datepicker
```js
window.initDatepicker('.datepicker', {
    type: 'date',           // 'date' | 'datetime' | 'time'
    format: 'd-m-Y',        // Date format
    minDate: '2024-01-01',  // Optional
    maxDate: '2025-12-31',  // Optional
});
```

That’s it! 🎉  
Your input field will now open a beautiful datepicker when focused.

---

## ⚙️ Options

| Option | Type | Default | Description |
|--------|------|----------|-------------|
| `type` | `string` | `'date'` | Picker type: `'date'`, `'datetime'`, or `'time'` |
| `format` | `string` | `'d-m-Y'` | Date format |
| `timeFormat` | `string` | `'HH:mm'` or `'hh:mm A'` | Time format (default depends on `timeMode`) |
| `timeMode` | `string` | auto | `'12'` or `'24'` (auto-inferred from `timeFormat`) |
| `dateTimeSeparator` | `string` | `' '` | Separator between date and time |
| `timeStepMinutes` | `number` | `1` | Minute step size (1-59) |
| `minDate` | `string` / `Date` | `null` | Minimum selectable date |
| `maxDate` | `string` / `Date` | `null` | Maximum selectable date |

---

## ⚙️ Supported Formats

### Date tokens
- `d` / `dd` = day  
- `m` / `mm` = month  
- `Y` / `YY` / `YYYY` = year  

Examples: `d-m-Y`, `dd/mm/YYYY`, `Y-m-d`

### Time tokens
- `H` / `HH` = 24-hour  
- `h` / `hh` = 12-hour  
- `m` / `mm` = minutes  
- `A` / `a` = AM/PM  

Examples: `HH:mm`, `hh:mm A`, `h:mm a`

---

## 🧰 Example

```html
<input type="text" class="datepicker" placeholder="Pick a date" data-min="2024-01-01" data-max="2024-12-31">

<script>
initDatepicker('.datepicker', {
  format: 'd-m-Y',
});
</script>
```

### DateTime example
```js
initDatepicker('.datetime', {
  type: 'datetime',
  format: 'd-m-Y',
  timeFormat: 'HH:mm',
});
```

### Time-only example
```js
initDatepicker('.time', {
  type: 'time',
  timeFormat: 'hh:mm A',
  timeMode: '12',
});
```

---

## 🎨 Customization

You can override styles using CSS. Example:

```css
.mdp-day.today {
  border: 1px solid #6200ea;
  color: #6200ea;
  font-weight: 600;
}
```

---

## 🧑‍💻 Author

**Uttam Khuntia**  
📦 npm: [@uttam-official](https://www.npmjs.com/~uttam-official)  
💼 GitHub: [uttam-official](https://github.com/uttam-official)

---

## 🪪 License

MIT License © 2025 [Uttam Khuntia](https://github.com/uttam-official)

---

> Made with ❤️ for developers who love simple, beautiful UIs.