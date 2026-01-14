// 配置狀態
const config = {
  movieId: null,
  venueId: null,
  eventId: null,
  ticketTypeCategory: null,
  quantity: 1,
  events: [] // 暫存場次資料
};

// DOM 元素
const elements = {
  movieSelect: document.getElementById('movie-select'),
  venueSelect: document.getElementById('venue-select'),
  timeSelect: document.getElementById('time-select'),
  ticketTypeSelect: document.getElementById('ticket-type-select'),
  quantitySelect: document.getElementById('quantity-select'),
  movieLoading: document.getElementById('movie-loading'),
  venueLoading: document.getElementById('venue-loading'),
  timeLoading: document.getElementById('time-loading'),
  ticketTypeLoading: document.getElementById('ticket-type-loading'),
  movieError: document.getElementById('movie-error'),
  venueError: document.getElementById('venue-error'),
  timeError: document.getElementById('time-error'),
  ticketTypeError: document.getElementById('ticket-type-error'),
  statusMessage: document.getElementById('status-message')
};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadSavedState();
  await loadMovies();
  setupEventListeners();
});

// 設定事件監聽器
function setupEventListeners() {
  elements.movieSelect.addEventListener('change', handleMovieChange);
  elements.venueSelect.addEventListener('change', handleVenueChange);
  elements.timeSelect.addEventListener('change', handleTimeChange);
  elements.ticketTypeSelect.addEventListener('change', handleTicketTypeChange);
  elements.quantitySelect.addEventListener('change', handleQuantityChange);
}

// 載入電影列表
async function loadMovies() {
  showLoading('movie');
  hideError('movie');
  
  try {
    const response = await fetch('https://capi.showtimes.com.tw/1/app/bootstrap?appVersion=2.9.200');
    const data = await response.json();
    
    if (data.msg === 'Success' && data.payload && data.payload.programs) {
      const activePrograms = data.payload.programs.filter(p => p.status === 'active');
      
      // 清空現有選項（保留預設選項）
      elements.movieSelect.innerHTML = '<option value="">請選擇電影</option>';
      
      // 加入電影選項
      activePrograms.forEach(program => {
        const option = document.createElement('option');
        option.value = program.id;
        option.textContent = program.name;
        elements.movieSelect.appendChild(option);
      });
      
      // 恢復選擇
      if (config.movieId) {
        elements.movieSelect.value = config.movieId;
        await loadVenuesAndTimes();
      }
    } else {
      throw new Error('無法取得電影列表');
    }
  } catch (error) {
    showError('movie', '載入失敗，請稍後再試');
    console.error('載入電影列表失敗:', error);
  } finally {
    hideLoading('movie');
  }
}

// 處理電影選擇變更
async function handleMovieChange() {
  const movieId = elements.movieSelect.value;
  
  if (!movieId) {
    resetDependentMenus(['venue', 'time', 'ticketType', 'quantity']);
    config.movieId = null;
    await saveState();
    return;
  }
  
  config.movieId = parseInt(movieId);
  await saveState();
  await loadVenuesAndTimes();
}

// 載入場地和時間
async function loadVenuesAndTimes() {
  if (!config.movieId) return;
  
  showLoading('venue');
  hideError('venue');
  hideError('time');
  
  try {
    const today = getTodayDate();
    const url = `https://capi.showtimes.com.tw/1/events/listForProgram/${config.movieId}?date=${today}&forVista=false`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.msg === 'Success' && data.payload) {
      // 載入場地
      if (data.payload.venues) {
        elements.venueSelect.innerHTML = '<option value="">請選擇場地</option>';
        data.payload.venues.forEach(venue => {
          const option = document.createElement('option');
          option.value = venue.id;
          option.textContent = venue.name;
          elements.venueSelect.appendChild(option);
        });
        elements.venueSelect.disabled = false;
        
        // 恢復場地選擇
        if (config.venueId) {
          elements.venueSelect.value = config.venueId;
          updateTimeOptions();
        }
      }
      
      // 暫存場次資料
      config.events = data.payload.events || [];
      
    } else {
      throw new Error('無法取得場地和時間資料');
    }
  } catch (error) {
    showError('venue', '載入失敗，請稍後再試');
    console.error('載入場地和時間失敗:', error);
  } finally {
    hideLoading('venue');
  }
}

// 處理場地選擇變更
function handleVenueChange() {
  const venueId = elements.venueSelect.value;
  
  if (!venueId) {
    resetDependentMenus(['time', 'ticketType', 'quantity']);
    config.venueId = null;
    saveState();
    return;
  }
  
  config.venueId = parseInt(venueId);
  saveState();
  updateTimeOptions();
}

// 更新時間選項
function updateTimeOptions() {
  if (!config.venueId || !config.events.length) return;
  
  // 過濾場次
  const filteredEvents = config.events.filter(
    event => event.venueId === config.venueId && event.status === 'active'
  );
  
  elements.timeSelect.innerHTML = '<option value="">請選擇時間</option>';
  
  filteredEvents.forEach(event => {
    const option = document.createElement('option');
    option.value = event.id;
    option.textContent = formatTime(event.startedAt);
    elements.timeSelect.appendChild(option);
  });
  
  elements.timeSelect.disabled = false;
  
  // 恢復時間選擇
  if (config.eventId) {
    elements.timeSelect.value = config.eventId;
    loadTicketTypes();
  }
}

// 處理時間選擇變更
async function handleTimeChange() {
  const eventId = elements.timeSelect.value;
  
  if (!eventId) {
    resetDependentMenus(['ticketType', 'quantity']);
    config.eventId = null;
    await saveState();
    return;
  }
  
  config.eventId = parseInt(eventId);
  await saveState();
  await loadTicketTypes();
}

// 載入票種
async function loadTicketTypes() {
  if (!config.eventId) return;
  
  showLoading('ticketType');
  hideError('ticketType');
  
  try {
    const url = `https://capi.showtimes.com.tw/1/ticketTypes/forEvent/${config.eventId}?includeGroupTicket=true&includeMemberRedeem=true&version=03.00.00`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.msg === 'Success' && data.payload && data.payload.ticketTypes) {
      elements.ticketTypeSelect.innerHTML = '<option value="">請選擇票種</option>';
      
      data.payload.ticketTypes.forEach(ticketType => {
        const option = document.createElement('option');
        option.value = ticketType.category;
        option.textContent = ticketType.title;
        elements.ticketTypeSelect.appendChild(option);
      });
      
      elements.ticketTypeSelect.disabled = false;
      
      // 恢復票種選擇
      if (config.ticketTypeCategory) {
        elements.ticketTypeSelect.value = config.ticketTypeCategory;
        updateQuantityOptions();
      }
    } else {
      throw new Error('無法取得票種資料');
    }
  } catch (error) {
    showError('ticketType', '載入失敗，請稍後再試');
    console.error('載入票種失敗:', error);
  } finally {
    hideLoading('ticketType');
  }
}

// 處理票種選擇變更
function handleTicketTypeChange() {
  const category = elements.ticketTypeSelect.value;
  
  if (!category) {
    resetDependentMenus(['quantity']);
    config.ticketTypeCategory = null;
    saveState();
    return;
  }
  
  config.ticketTypeCategory = category;
  saveState();
  updateQuantityOptions();
}

// 更新數量選項
function updateQuantityOptions() {
  elements.quantitySelect.innerHTML = '<option value="">請選擇數量</option>';
  
  for (let i = 1; i <= 6; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    elements.quantitySelect.appendChild(option);
  }
  
  elements.quantitySelect.disabled = false;
  elements.quantitySelect.value = config.quantity || 1;
  
  checkCompletion();
}

// 處理數量選擇變更
function handleQuantityChange() {
  const quantity = elements.quantitySelect.value;
  
  if (quantity) {
    config.quantity = parseInt(quantity);
    saveState();
    checkCompletion();
  }
}

// 檢查配置是否完成
function checkCompletion() {
  if (config.movieId && config.venueId && config.eventId && 
      config.ticketTypeCategory && config.quantity) {
    showStatusMessage('配置完成！', 'success');
  } else {
    hideStatusMessage();
  }
}

// 重置依賴選單
function resetDependentMenus(menuNames) {
  menuNames.forEach(name => {
    const select = elements[`${name}Select`];
    if (select) {
      select.innerHTML = `<option value="">請先選擇${getPreviousMenuName(name)}</option>`;
      select.disabled = true;
      select.value = '';
    }
  });
}

// 取得前置選單名稱
function getPreviousMenuName(currentMenu) {
  const menuOrder = {
    'venue': '電影',
    'time': '場地',
    'ticketType': '時間',
    'quantity': '票種'
  };
  return menuOrder[currentMenu] || '';
}

// 格式化時間（轉換為 GMT+8）
function formatTime(isoString) {
  const date = new Date(isoString);
  const gmt8Date = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  
  const year = gmt8Date.getUTCFullYear();
  const month = String(gmt8Date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(gmt8Date.getUTCDate()).padStart(2, '0');
  const hours = String(gmt8Date.getUTCHours()).padStart(2, '0');
  const minutes = String(gmt8Date.getUTCMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 取得今天的日期（YYYY-MM-DD）
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 顯示載入狀態
function showLoading(menu) {
  const loading = elements[`${menu}Loading`];
  if (loading) loading.style.display = 'block';
}

// 隱藏載入狀態
function hideLoading(menu) {
  const loading = elements[`${menu}Loading`];
  if (loading) loading.style.display = 'none';
}

// 顯示錯誤訊息
function showError(menu, message) {
  const error = elements[`${menu}Error`];
  if (error) {
    error.textContent = message;
    error.style.display = 'block';
  }
}

// 隱藏錯誤訊息
function hideError(menu) {
  const error = elements[`${menu}Error`];
  if (error) error.style.display = 'none';
}

// 顯示狀態訊息
function showStatusMessage(message, type) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `status-message ${type}`;
  elements.statusMessage.style.display = 'block';
}

// 隱藏狀態訊息
function hideStatusMessage() {
  elements.statusMessage.style.display = 'none';
}

// 儲存狀態
async function saveState() {
  try {
    await chrome.storage.local.set({
      ticketConfig: {
        movieId: config.movieId,
        venueId: config.venueId,
        eventId: config.eventId,
        ticketTypeCategory: config.ticketTypeCategory,
        quantity: config.quantity
      }
    });
  } catch (error) {
    console.error('儲存狀態失敗:', error);
  }
}

// 載入儲存的狀態
async function loadSavedState() {
  try {
    const result = await chrome.storage.local.get('ticketConfig');
    if (result.ticketConfig) {
      const saved = result.ticketConfig;
      config.movieId = saved.movieId;
      config.venueId = saved.venueId;
      config.eventId = saved.eventId;
      config.ticketTypeCategory = saved.ticketTypeCategory;
      config.quantity = saved.quantity || 1;
    }
  } catch (error) {
    console.error('載入狀態失敗:', error);
  }
}
