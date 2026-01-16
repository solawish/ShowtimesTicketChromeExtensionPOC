// 配置狀態
const config = {
  movieId: null,
  venueId: null,
  venueName: null, // 儲存選定的場地名稱
  eventId: null,
  ticketTypeCategory: null,
  selectedTicketType: null, // 儲存選定的完整票種物件
  ticketTypes: [], // 暫存票種資料
  quantity: 1,
  events: [], // 暫存場次資料
  venueNameToIds: {} // 場地名稱到 ID 陣列的映射
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
  statusMessage: document.getElementById('status-message'),
  bookButton: document.getElementById('book-button'),
  ticketTypeReloadButton: document.getElementById('ticket-type-reload-button')
};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadSavedState();
  await loadMovies();
  setupEventListeners();
  updateBookButtonState();
  updateTicketTypeReloadButtonState();
});

// 設定事件監聽器
function setupEventListeners() {
  elements.movieSelect.addEventListener('change', handleMovieChange);
  elements.venueSelect.addEventListener('change', handleVenueChange);
  elements.timeSelect.addEventListener('change', handleTimeChange);
  elements.ticketTypeSelect.addEventListener('change', handleTicketTypeChange);
  elements.quantitySelect.addEventListener('change', handleQuantityChange);
  elements.bookButton.addEventListener('click', handleBookClick);
  elements.ticketTypeReloadButton.addEventListener('click', handleTicketTypeReload);
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
    config.venueId = null;
    config.venueName = null;
    config.eventId = null;
    config.ticketTypeCategory = null;
    config.selectedTicketType = null;
    config.ticketTypes = [];
    config.quantity = 1;
    updateBookButtonState();
    await saveState();
    return;
  }
  
  // 當電影改變為新值時，重置所有下層選單的 config 值
  const previousMovieId = config.movieId;
  config.movieId = parseInt(movieId);
  
  // 如果電影改變了（不是第一次選擇），重置下層選單的 config 值
  if (previousMovieId !== null && previousMovieId !== config.movieId) {
    config.venueId = null;
    config.venueName = null;
    config.eventId = null;
    config.ticketTypeCategory = null;
    config.selectedTicketType = null;
    config.ticketTypes = [];
    config.quantity = 1;
    config.venueNameToIds = {};
    // 重置下層選單，但保持禁用狀態（會在 loadVenuesAndTimes 中啟用）
    resetDependentMenus(['venue', 'time', 'ticketType', 'quantity']);
    updateBookButtonState();
  }
  
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
      // 先暫存場次資料，這樣 updateTimeOptions() 才能正確運作
      config.events = data.payload.events || [];
      
      // 載入場地
      if (data.payload.venues) {
        // 建立場地名稱到 ID 陣列的映射
        config.venueNameToIds = {};
        data.payload.venues.forEach(venue => {
          if (!config.venueNameToIds[venue.name]) {
            config.venueNameToIds[venue.name] = [];
          }
          config.venueNameToIds[venue.name].push(venue.id);
        });
        
        // 去重場地名稱，只顯示唯一的 name
        const uniqueVenueNames = Object.keys(config.venueNameToIds);
        elements.venueSelect.innerHTML = '<option value="">請選擇場地</option>';
        uniqueVenueNames.forEach(venueName => {
          const option = document.createElement('option');
          option.value = venueName; // 使用 name 作為值
          option.textContent = venueName;
          elements.venueSelect.appendChild(option);
        });
        elements.venueSelect.disabled = false;
        
        // 恢復場地選擇（使用 name）
        if (config.venueName) {
          elements.venueSelect.value = config.venueName;
          updateTimeOptions();
        } else {
          // 確保顯示預設選項
          elements.venueSelect.value = '';
        }
      }
      
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
  const venueName = elements.venueSelect.value;
  
  if (!venueName) {
    resetDependentMenus(['time', 'ticketType', 'quantity']);
    config.venueId = null;
    config.venueName = null;
    config.eventId = null;
    config.ticketTypeCategory = null;
    config.selectedTicketType = null;
    config.ticketTypes = [];
    config.quantity = 1;
    updateBookButtonState();
    saveState();
    return;
  }
  
  // 當場地改變為新值時，重置所有下層選單的 config 值
  const previousVenueName = config.venueName;
  config.venueName = venueName;
  
  // 找到所有相同 name 的 venueId
  const venueIds = config.venueNameToIds[venueName] || [];
  // 使用第一個 id 作為主要 id（用於向後兼容）
  config.venueId = venueIds.length > 0 ? venueIds[0] : null;
  
  // 如果場地改變了（不是第一次選擇），重置下層選單的 config 值
  if (previousVenueName !== null && previousVenueName !== config.venueName) {
    config.eventId = null;
    config.ticketTypeCategory = null;
    config.selectedTicketType = null;
    config.ticketTypes = [];
    config.quantity = 1;
    // 重置下層選單，但保持禁用狀態（會在 updateTimeOptions 中啟用）
    resetDependentMenus(['time', 'ticketType', 'quantity']);
    updateBookButtonState();
  }
  
  saveState();
  updateTimeOptions();
}

// 更新時間選項
function updateTimeOptions() {
  if (!config.venueName || !config.events.length) return;
  
  // 找到所有相同 name 的 venueId
  const venueIds = config.venueNameToIds[config.venueName] || [];
  if (venueIds.length === 0) return;
  
  // 過濾場次：使用所有相同 name 的 venueId
  let filteredEvents = config.events.filter(
    event => venueIds.includes(event.venueId) && event.status === 'active'
  );
  
  // 按照 startedAt 時間排序：比較早的時間排在前面
  filteredEvents.sort((a, b) => {
    const aTime = new Date(a.startedAt).getTime();
    const bTime = new Date(b.startedAt).getTime();
    return aTime - bTime;
  });
  
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
  } else {
    // 確保顯示預設選項
    elements.timeSelect.value = '';
  }
}

// 處理時間選擇變更
async function handleTimeChange() {
  const eventId = elements.timeSelect.value;
  
  if (!eventId) {
    resetDependentMenus(['ticketType', 'quantity']);
    config.eventId = null;
    updateBookButtonState();
    updateTicketTypeReloadButtonState();
    await saveState();
    return;
  }
  
  // 當時間改變為新值時，重置所有下層選單的 config 值
  const previousEventId = config.eventId;
  config.eventId = parseInt(eventId);
  updateBookButtonState();
  // 已選擇時間，啟用重新讀取按鈕
  updateTicketTypeReloadButtonState();
  
  // 如果時間改變了（不是第一次選擇），重置下層選單的 config 值
  if (previousEventId !== null && previousEventId !== config.eventId) {
    config.ticketTypeCategory = null;
    config.quantity = 1;
    // 重置下層選單，但保持禁用狀態（會在 loadTicketTypes 中啟用）
    resetDependentMenus(['ticketType', 'quantity']);
  }
  
  await saveState();
  await loadTicketTypes();
}

// 載入票種
async function loadTicketTypes() {
  if (!config.eventId) {
    updateTicketTypeReloadButtonState();
    return;
  }
  
  showLoading('ticketType');
  hideError('ticketType');
  // 確保在載入中時按鈕也是啟用的
  updateTicketTypeReloadButtonState();
  
  try {
    const url = `https://capi.showtimes.com.tw/1/ticketTypes/forEvent/${config.eventId}?includeGroupTicket=true&includeMemberRedeem=true&version=03.00.00`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.msg === 'Success' && data.payload && data.payload.ticketTypes) {
      // 暫存完整的票種資料
      config.ticketTypes = data.payload.ticketTypes;
      
      elements.ticketTypeSelect.innerHTML = '<option value="">請選擇票種</option>';
      
      data.payload.ticketTypes.forEach(ticketType => {
        const option = document.createElement('option');
        // 取得 subCategory，可能從 ticketType.subCategory 或 meta.sources.vista 中取得
        let subCategory = ticketType.subCategory;
        if (!subCategory && ticketType.meta && ticketType.meta.sources && ticketType.meta.sources.vista) {
          const vistaSource = ticketType.meta.sources.vista;
          if (typeof vistaSource === 'string' && vistaSource.includes('-')) {
            subCategory = vistaSource.split('-')[1];
          } else if (vistaSource && vistaSource.TicketTypeCode) {
            subCategory = vistaSource.TicketTypeCode;
          }
        }
        // 使用 category.subCategory 作為 value
        option.value = `${ticketType.category}.${subCategory || ''}`;
        option.textContent = ticketType.title;
        elements.ticketTypeSelect.appendChild(option);
      });
      
      elements.ticketTypeSelect.disabled = false;
      updateTicketTypeReloadButtonState();
      
      // 恢復票種選擇
      if (config.ticketTypeCategory) {
        elements.ticketTypeSelect.value = config.ticketTypeCategory;
        // 恢復選定的完整票種物件
        // config.ticketTypeCategory 現在是 category.subCategory 格式
        const [category, subCategory] = config.ticketTypeCategory.split('.');
        const selectedType = config.ticketTypes.find(tt => {
          let ttSubCategory = tt.subCategory;
          if (!ttSubCategory && tt.meta && tt.meta.sources && tt.meta.sources.vista) {
            const vistaSource = tt.meta.sources.vista;
            if (typeof vistaSource === 'string' && vistaSource.includes('-')) {
              ttSubCategory = vistaSource.split('-')[1];
            } else if (vistaSource && vistaSource.TicketTypeCode) {
              ttSubCategory = vistaSource.TicketTypeCode;
            }
          }
          return tt.category === category && (ttSubCategory || '') === (subCategory || '');
        });
        if (selectedType) {
          config.selectedTicketType = selectedType;
        }
        updateQuantityOptions();
      } else {
        // 確保顯示預設選項
        elements.ticketTypeSelect.value = '';
      }
    } else {
      throw new Error('無法取得票種資料');
    }
  } catch (error) {
    showError('ticketType', '載入失敗，請稍後再試');
    console.error('載入票種失敗:', error);
  } finally {
    hideLoading('ticketType');
    updateTicketTypeReloadButtonState();
  }
}

// 處理票種重新讀取按鈕點擊
async function handleTicketTypeReload() {
  // 只要已選擇時間（有 eventId），就可以重新載入，不管選單是否禁用
  if (!config.eventId) {
    return;
  }
  
  // 保存當前選定的票種類別，以便重新載入後嘗試恢復
  const currentTicketTypeCategory = config.ticketTypeCategory;
  
  // 重新載入票種資料
  await loadTicketTypes();
  
  // 嘗試恢復之前選定的票種（如果仍存在）
  if (currentTicketTypeCategory) {
    const [category, subCategory] = currentTicketTypeCategory.split('.');
    const selectedType = config.ticketTypes.find(tt => {
      let ttSubCategory = tt.subCategory;
      if (!ttSubCategory && tt.meta && tt.meta.sources && tt.meta.sources.vista) {
        const vistaSource = tt.meta.sources.vista;
        if (typeof vistaSource === 'string' && vistaSource.includes('-')) {
          ttSubCategory = vistaSource.split('-')[1];
        } else if (vistaSource && vistaSource.TicketTypeCode) {
          ttSubCategory = vistaSource.TicketTypeCode;
        }
      }
      return tt.category === category && (ttSubCategory || '') === (subCategory || '');
    });
    
    if (selectedType) {
      // 票種仍存在，恢復選擇
      elements.ticketTypeSelect.value = currentTicketTypeCategory;
      config.ticketTypeCategory = currentTicketTypeCategory;
      config.selectedTicketType = selectedType;
      updateQuantityOptions();
    } else {
      // 票種不存在，清空選擇
      elements.ticketTypeSelect.value = '';
      config.ticketTypeCategory = null;
      config.selectedTicketType = null;
      resetDependentMenus(['quantity']);
    }
    await saveState();
  }
}

// 更新票種重新讀取按鈕狀態
function updateTicketTypeReloadButtonState() {
  if (elements.ticketTypeReloadButton) {
    // 按鈕應在已選擇時間（有 eventId）時才可點擊
    // 即使在載入中或失敗時，只要已選擇時間，按鈕就應該啟用
    elements.ticketTypeReloadButton.disabled = !config.eventId;
  }
}

// 處理票種選擇變更
function handleTicketTypeChange() {
  const value = elements.ticketTypeSelect.value; // 現在是 category.subCategory 格式
  
  if (!value) {
    resetDependentMenus(['quantity']);
    config.ticketTypeCategory = null;
    config.selectedTicketType = null;
    saveState();
    return;
  }
  
  // 當票種改變為新值時，重置數量選單的 config 值
  const previousCategory = config.ticketTypeCategory;
  config.ticketTypeCategory = value; // 儲存 category.subCategory 格式
  
  // 從暫存的票種資料中找出完整的票種物件
  const [category, subCategory] = value.split('.');
  const selectedType = config.ticketTypes.find(tt => {
    let ttSubCategory = tt.subCategory;
    if (!ttSubCategory && tt.meta && tt.meta.sources && tt.meta.sources.vista) {
      const vistaSource = tt.meta.sources.vista;
      if (typeof vistaSource === 'string' && vistaSource.includes('-')) {
        ttSubCategory = vistaSource.split('-')[1];
      } else if (vistaSource && vistaSource.TicketTypeCode) {
        ttSubCategory = vistaSource.TicketTypeCode;
      }
    }
    return tt.category === category && (ttSubCategory || '') === (subCategory || '');
  });
  if (selectedType) {
    config.selectedTicketType = selectedType;
  }
  
  // 如果票種改變了（不是第一次選擇），重置數量選單的 config 值
  if (previousCategory !== null && previousCategory !== config.ticketTypeCategory) {
    config.quantity = 1;
    // 重置數量選單，但保持禁用狀態（會在 updateQuantityOptions 中啟用）
    resetDependentMenus(['quantity']);
  }
  
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
  updateBookButtonState();
  if (config.movieId && config.venueId && config.eventId && 
      config.ticketTypeCategory && config.quantity) {
    showStatusMessage('配置完成！', 'success');
  } else {
    hideStatusMessage();
  }
}

// 更新訂票按鈕可用狀態
function updateBookButtonState() {
  if (!elements.bookButton) return;
  elements.bookButton.disabled = !config.eventId;
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
    // 如果重置的是票種選單，同時禁用重新讀取按鈕
    if (name === 'ticketType') {
      updateTicketTypeReloadButtonState();
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

// 取得選單顯示名稱
function getMenuDisplayName(menuName) {
  const menuNames = {
    'venue': '場地',
    'time': '時間',
    'ticketType': '票種',
    'quantity': '數量'
  };
  return menuNames[menuName] || '';
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
        venueName: config.venueName, // 儲存場地名稱
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
      config.venueName = saved.venueName; // 載入場地名稱
      config.eventId = saved.eventId;
      config.ticketTypeCategory = saved.ticketTypeCategory;
      config.quantity = saved.quantity || 1;
    }
  } catch (error) {
    console.error('載入狀態失敗:', error);
  }
}

// 處理訂票按鈕：取得座位、鎖定座位並建立訂單
async function handleBookClick() {
  if (!config.eventId) {
    showStatusMessage('請先選擇電影、場地與時間', 'error');
    return;
  }
  
  if (!config.selectedTicketType) {
    showStatusMessage('請先選擇票種', 'error');
    return;
  }
  
  if (!config.quantity) {
    showStatusMessage('請先選擇數量', 'error');
    return;
  }
  
  try {
    // 取得 JWT
    showStatusMessage('取得登入權杖中...', 'info');
    const jwt = await getShowtimesJwt();
    if (!jwt) {
      throw new Error('無法取得登入權杖，請確認已在秀泰網站登入');
    }
    
    // 取得座位（每次訂票都重新取得）
    showStatusMessage('取得座位中...', 'info');
    const seats = await fetchAvailableSeats(config.eventId, config.quantity, jwt);
    console.log('已選擇座位:', seats);
    
    // 鎖定座位
    showStatusMessage('鎖定座位中...', 'info');
    const lockResult = await lockSeatsForEvent(
      config.eventId,
      seats,
      config.selectedTicketType,
      config.quantity,
      jwt
    );
    console.log('鎖定座位成功:', lockResult);
    
    // 建立訂單
    showStatusMessage('建立訂單中...', 'info');
    const orderResult = await createOrder(
      config.eventId,
      seats,
      config.selectedTicketType,
      config.quantity,
      lockResult.orderNo,
      jwt
    );
    console.log('建立訂單成功:', orderResult);
    
    // 取得付款資訊並提交付款表單
    showStatusMessage('準備付款頁面...', 'info');
    const urlEnc = orderResult?.payload?.order?.payment?.clientFormInputs?.URLEnc;
    if (!urlEnc) {
      throw new Error('無法取得付款資訊，訂單回應中缺少 URLEnc');
    }
    
    submitPaymentForm(urlEnc);
  } catch (error) {
    console.error('訂票流程失敗:', error);
    showStatusMessage(error.message || '訂票失敗，請稍後再試', 'error');
  }
}

// 從秀泰網站的 localStorage 取得 JWT
async function getShowtimesJwt() {
  const activeTab = await getActiveShowtimesTab();
  if (!activeTab) {
    throw new Error('請先在秀泰網站分頁開啟並登入');
  }
  
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => {
      const loginKey = Object.keys(localStorage).find(key =>
        key.startsWith('LoginSore.loggedInUser.')
      );
      if (!loginKey) return null;
      try {
        const raw = localStorage.getItem(loginKey);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && parsed.jwt ? parsed.jwt : null;
      } catch (err) {
        console.warn('解析登入資訊失敗', err);
        return null;
      }
    }
  });
  
  return result;
}

// 取得目前視窗中秀泰網站的分頁
async function getActiveShowtimesTab() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (!tabs || !tabs.length) return null;
  
  // 優先使用當前分頁，其次使用同視窗中的其他秀泰分頁
  const activeTab = tabs.find(tab => tab.active);
  if (activeTab && isShowtimesUrl(activeTab.url)) {
    return activeTab;
  }
  
  const otherShowtimesTab = tabs.find(tab => isShowtimesUrl(tab.url));
  return otherShowtimesTab || null;
}

// 簡易判斷是否為秀泰網站
function isShowtimesUrl(url) {
  return typeof url === 'string' && url.includes('showtimes.com.tw');
}

// 呼叫座位 API 並挑選可用座位
async function fetchAvailableSeats(eventId, quantity, jwt) {
  const url = `https://capi.showtimes.com.tw/1/seats/listForEvent/${eventId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  
  if (!response.ok) {
    throw new Error('座位 API 請求失敗');
  }
  
  const data = await response.json();
  const seats = data && data.payload && Array.isArray(data.payload.seats)
    ? data.payload.seats
    : [];
  
  // 過濾可用座位：排除沒有 e 屬性的座位，以及 e === false 的座位
  const allAvailableSeats = seats.filter(seat => seat && seat.hasOwnProperty('e') && seat.e === true);
  
  if (allAvailableSeats.length < quantity) {
    throw new Error(`可用座位不足，需要 ${quantity} 個座位，但只有 ${allAvailableSeats.length} 個可用`);
  }
  
  // 輔助函數：將 r 或 c 轉換為數字（支援字串和數字）
  const toNumber = (value) => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const num = parseInt(value, 10);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };
  
  // 找出所有座位的最大 r 和 c 值（用於確定座位範圍）
  let maxR = 0;
  let maxC = 0;
  seats.forEach(seat => {
    if (seat) {
      const r = toNumber(seat.r);
      const c = toNumber(seat.c);
      if (r > maxR) {
        maxR = r;
      }
      if (c > maxC) {
        maxC = c;
      }
    }
  });
  
  // 計算中間值：c 最大為 8 則選 4，最大為 9 則選 5
  const middleC = Math.floor((maxC + 1) / 2);
  const middleR = Math.floor((maxR + 1) / 2);
  
  // 計算每排（r值）的座位資訊：座位數量和有效範圍（中間50%）
  const rowInfo = {};
  for (let r = 1; r <= maxR; r++) {
    const seatsInRow = seats.filter(seat => {
      const seatR = toNumber(seat.r);
      return seatR === r;
    });
    const seatCount = seatsInRow.length;
    if (seatCount > 0) {
      // 取得該排所有座位的c值並排序
      const cValues = seatsInRow
        .map(seat => toNumber(seat.c))
        .filter(c => c > 0)
        .sort((a, b) => a - b);
      
      if (cValues.length > 0) {
        // 計算前25%和後25%的範圍，中間50%為有效範圍
        const excludeCount = Math.ceil(cValues.length * 0.25); // 前25%的數量
        // 確保至少有中間50%的範圍（如果座位太少，則使用全部範圍）
        const startIndex = Math.min(excludeCount, cValues.length - 1);
        const endIndex = Math.max(cValues.length - 1 - excludeCount, startIndex);
        const minC = cValues[startIndex]; // 有效範圍的最小c值（排除前25%後的第一個）
        const maxC = cValues[endIndex]; // 有效範圍的最大c值（排除後25%後的最後一個）
        rowInfo[r] = {
          seatCount,
          minC,
          maxC,
          cValues
        };
      }
    }
  }
  
  // 選取座位的函數：選擇最接近中間的座位
  const selectBestSeat = (availableSeats, previousSeat = null) => {
    if (availableSeats.length === 0) {
      return null;
    }
    
    // 如果是選取第二張及之後的票，且前一張座位存在，優先檢查同一排
    if (previousSeat && quantity > 1) {
      const previousR = toNumber(previousSeat.r);
      const previousC = toNumber(previousSeat.c);
      
      // 檢查該排是否有有效範圍資訊
      if (rowInfo[previousR]) {
        const { minC, maxC } = rowInfo[previousR];
        
        // 找出同一排（r值相同）且c值在有效範圍內的可用座位
        const sameRowSeats = availableSeats.filter(seat => {
          const seatR = toNumber(seat.r);
          const seatC = toNumber(seat.c);
          return seatR === previousR && seatC >= minC && seatC <= maxC;
        });
        
        // 如果找到符合條件的同一排座位，優先選擇c值最接近前一個座位的
        if (sameRowSeats.length > 0) {
          let bestSeat = sameRowSeats[0];
          let minCDistance = Infinity;
          
          sameRowSeats.forEach(seat => {
            const seatC = toNumber(seat.c);
            const cDistance = Math.abs(seatC - previousC);
            if (cDistance < minCDistance) {
              minCDistance = cDistance;
              bestSeat = seat;
            }
          });
          
          return bestSeat;
        }
      }
    }
    
    // 如果沒有符合同一排條件的座位，使用原本的中間偏好邏輯
    // 先過濾掉所有不在有效範圍內的座位（排除前後25%）
    const validRangeSeats = availableSeats.filter(seat => {
      if (!seat) return false;
      const seatR = toNumber(seat.r);
      const seatC = toNumber(seat.c);
      
      // 檢查該排是否有有效範圍資訊
      if (rowInfo[seatR]) {
        const { minC, maxC } = rowInfo[seatR];
        // 只保留在有效範圍內的座位
        return seatC >= minC && seatC <= maxC;
      }
      // 如果該排沒有範圍資訊，則保留（可能是邊界情況）
      return true;
    });
    
    // 如果過濾後沒有有效座位，則使用所有可用座位（fallback）
    const seatsToConsider = validRangeSeats.length > 0 ? validRangeSeats : availableSeats;
    
    // 找出 r 值最接近中間的座位（先選中間的排）
    let bestSeats = [];
    let minRDistance = Infinity;
    
    seatsToConsider.forEach(seat => {
      if (seat) {
        const r = toNumber(seat.r);
        const rDistance = Math.abs(r - middleR);
        if (rDistance < minRDistance) {
          minRDistance = rDistance;
          bestSeats = [seat];
        } else if (rDistance === minRDistance) {
          bestSeats.push(seat);
        }
      }
    });
    
    // 如果沒有找到有效的座位，返回第一個可用座位
    if (bestSeats.length === 0) {
      return seatsToConsider[0] || availableSeats[0];
    }
    
    // 在相同 r 值中，找出 c 值最接近中間的座位（選該排中間的座位）
    if (bestSeats.length === 1) {
      return bestSeats[0];
    }
    
    let bestSeat = bestSeats[0];
    let minCDistance = Infinity;
    
    bestSeats.forEach(seat => {
      if (seat) {
        const c = toNumber(seat.c);
        const cDistance = Math.abs(c - middleC);
        if (cDistance < minCDistance) {
          minCDistance = cDistance;
          bestSeat = seat;
        }
      }
    });
    
    return bestSeat;
  };
  
  // 選取指定數量的座位
  const selectedSeats = [];
  const remainingSeats = [...allAvailableSeats];
  
  for (let i = 0; i < quantity; i++) {
    // 傳入前一張選取的座位（如果有的話）
    const previousSeat = selectedSeats.length > 0 ? selectedSeats[selectedSeats.length - 1] : null;
    const bestSeat = selectBestSeat(remainingSeats, previousSeat);
    if (!bestSeat) {
      throw new Error(`無法選取第 ${i + 1} 張票的座位`);
    }
    
    selectedSeats.push(bestSeat);
    
    // 從剩餘座位中移除已選座位（使用參考相等或座標比對）
    const index = remainingSeats.findIndex(seat => {
      // 使用參考相等（最準確）
      if (seat === bestSeat) {
        return true;
      }
      // 使用座標比對（x, y）
      if (seat.x === bestSeat.x && seat.y === bestSeat.y) {
        return true;
      }
      // 使用 r 和 c 比對（支援字串和數字）
      const seatR = toNumber(seat.r);
      const seatC = toNumber(seat.c);
      const bestR = toNumber(bestSeat.r);
      const bestC = toNumber(bestSeat.c);
      if (seatR === bestR && seatC === bestC && seatR > 0 && seatC > 0) {
        return true;
      }
      return false;
    });
    if (index !== -1) {
      remainingSeats.splice(index, 1);
    }
  }
  
  return selectedSeats;
}

// 產生 GUID
function generateGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 鎖定座位
async function lockSeatsForEvent(eventId, seats, ticketType, quantity, jwt) {
  const url = `https://capi.showtimes.com.tw/1/seats/lockForEvent/${eventId}`;
  const orderGuid = generateGuid();
  
  // 建構 selectedTicketTypes 陣列
  const selectedTicketTypes = [{
    ...ticketType,
    selectedTtCount: quantity
  }];
  
  const requestBody = {
    seats: seats, // seats 已經是陣列
    orderGuid: orderGuid,
    selectedTicketTypes: selectedTicketTypes
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.msg || '鎖定座位失敗');
  }
  
  const data = await response.json();
  if (data.msg !== 'Success' || !data.payload) {
    throw new Error('鎖定座位回應格式錯誤');
  }
  
  return {
    reservationKey: data.payload.reservationKey,
    orderNo: data.payload.orderNo
  };
}

// 從 localStorage 取得 email 和 phone
async function getShowtimesUserInfo() {
  const activeTab = await getActiveShowtimesTab();
  if (!activeTab) {
    throw new Error('請先在秀泰網站分頁開啟並登入');
  }
  
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => {
      const loginKey = Object.keys(localStorage).find(key =>
        key.startsWith('LoginSore.loggedInUser.')
      );
      if (!loginKey) return null;
      try {
        const raw = localStorage.getItem(loginKey);
        const parsed = raw ? JSON.parse(raw) : null;
        if (!parsed) return null;
        return {
          email: parsed.email || null,
          phone: parsed.phone || null
        };
      } catch (err) {
        console.warn('解析登入資訊失敗', err);
        return null;
      }
    }
  });
  
  if (!result || !result.email || !result.phone) {
    throw new Error('無法取得使用者聯絡資訊，請確認已在秀泰網站登入並設定 email 和 phone');
  }
  
  return result;
}

// 建立訂單
async function createOrder(eventId, seats, ticketType, quantity, orderNo, jwt) {
  const url = `https://capi.showtimes.com.tw/1/orders`;
  
  // 取得使用者聯絡資訊
  const userInfo = await getShowtimesUserInfo();
  
  // 建構 ticketTypeCount 物件
  // subCategory 可能在 ticketType.subCategory 或 meta.sources.vista 中（格式：CinemaId-TicketTypeCode）
  let subCategory = ticketType.subCategory;
  if (!subCategory && ticketType.meta && ticketType.meta.sources && ticketType.meta.sources.vista) {
    const vistaSource = ticketType.meta.sources.vista;
    if (typeof vistaSource === 'string' && vistaSource.includes('-')) {
      subCategory = vistaSource.split('-')[1];
    } else if (vistaSource && vistaSource.TicketTypeCode) {
      subCategory = vistaSource.TicketTypeCode;
    }
  }
  const ticketTypeKey = `${ticketType.category}.${subCategory || ''}`;
  const ticketTypeCount = {};
  ticketTypeCount[ticketTypeKey] = quantity;
  
  // 計算金額：票價加上手續費後，再乘以張數
  const amount = (ticketType.price + ticketType.fee) * quantity;
  const fee = ticketType.fee * quantity; // 從票種資料取得 fee
  
  const requestBody = {
    concessionCount: {},
    items: [{
      event: {
        id: eventId
      },
      ticketTypeCount: ticketTypeCount,
      seats: seats, // seats 已經是陣列
      amount: amount
    }],
    meta: {
      sources: {
        vista: {
          orderNo: orderNo
        }
      },
      receiptRequest: {
        type: 'love',
        data: '919',
        email: userInfo.email
      },
      contact: {
        email: userInfo.email,
        phone: userInfo.phone
      }
    },
    email: userInfo.email,
    payWith: 'chinaTrustUrl',
    fee: fee
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.msg || '建立訂單失敗');
  }
  
  const data = await response.json();
  if (data.msg !== 'Success') {
    throw new Error('建立訂單回應格式錯誤');
  }
  
  return data;
}

// 動態建立並提交付款表單
async function submitPaymentForm(urlEnc) {
  if (!urlEnc) {
    throw new Error('無法取得付款資訊，訂單回應中缺少 URLEnc');
  }
  
  // 建立包含表單的 HTML 內容
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>付款處理中...</title>
</head>
<body>
  <form id="paymentForm" method="POST" action="https://epos.ctbcbank.com/auth/SSLAuthUI.jsp" enctype="application/x-www-form-urlencoded">
    <input type="hidden" name="URLEnc" value="${urlEnc.replace(/"/g, '&quot;')}">
    <input type="hidden" name="merID" value="86511">
  </form>
  <script>
    document.getElementById('paymentForm').submit();
  </script>
</body>
</html>`;
  
  // 將 HTML 轉換為 data URL
  const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
  
  // 開啟新 tab 並載入包含表單的 HTML
  await chrome.tabs.create({
    url: dataUrl
  });
}
