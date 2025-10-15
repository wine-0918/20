document.addEventListener("DOMContentLoaded", () => {
    // --- 付き合ってからの日数計算 ---
    const startDate = new Date(2019, 6, 14); /* これで7.14 */
    const today = new Date();
    const diffTime = today - startDate;
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById("days-count").textContent = days;
  
    // --- カレンダー生成 ---
    const calendarGrid = document.querySelector(".calendar-grid");
    const calendarTitle = document.getElementById("calendar-title");
    const planData = {
      "2025-4-20": "美容室",
      "2025-4-30": "お泊り",
      "2025-5-1": "お泊り",
    };
  
    let currentDate = new Date();
  
    function renderCalendar(date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      calendarTitle.textContent = `${year}年${month + 1}月`;
  
      // カレンダー部分クリア
      while (calendarGrid.children.length > 7) {
        calendarGrid.removeChild(calendarGrid.lastChild);
      }
  
      const firstDay = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();
  
      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        calendarGrid.appendChild(empty);
      }
  
      for (let d = 1; d <= lastDate; d++) {
        const cell = document.createElement("div");
        const key = `${year}-${month + 1}-${d}`;
  
        if (planData[key]) {
          cell.classList.add("has-title");
          cell.textContent = planData[key];
          cell.title = `${d}日の予定`;
          cell.onclick = () => {
            const target = document.getElementById(`plan-${key}`);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          };
        } else {
          cell.textContent = d;
        }
  
        calendarGrid.appendChild(cell);
      }
    }
  
    document.getElementById("prev-month").addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(currentDate);
    });
  
    document.getElementById("next-month").addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(currentDate);
    });
  
    renderCalendar(currentDate);
  });
  