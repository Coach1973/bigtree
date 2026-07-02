// 回到頂端按鈕
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Navbar 捲動效果
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// 手機選單
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// 捲動淡入（iframe 內直接顯示，不等 IntersectionObserver）
var inIframe = (window.self !== window.top);
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); } });
}, { threshold: 0.05, rootMargin: '200px' });
document.querySelectorAll('.pain-card,.service-card,.course-card,.speaking-card,.testi-card,.stat-item').forEach(el => {
  el.classList.add('fade');
  if (inIframe) { el.classList.add('in'); } else { observer.observe(el); }
});

// 數字計數動畫
const numEls = document.querySelectorAll('.stat-num[data-target]');
const numObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.target);
    let cur = 0;
    const step = target / 60;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur).toLocaleString();
      if (cur >= target) clearInterval(t);
    }, 16);
    numObs.unobserve(el);
  });
}, { threshold: 0.5 });
numEls.forEach(el => numObs.observe(el));

// 語錄輪播
(function() {
  const track = document.getElementById('qTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.carousel-card');
  const total = cards.length;
  let idx = 0;

  function perView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function update() {
    const pv = perView();
    if (idx > total - pv) idx = Math.max(0, total - pv);
    track.style.transform = 'translateX(-' + (idx * 100 / pv) + '%)';
    var atStart = idx === 0, atEnd = idx >= total - pv;
    ['qPrev','qPrevBottom'].forEach(function(id) {
      var b = document.getElementById(id);
      if (b) { b.style.opacity = atStart ? '0.3' : '1'; b.style.pointerEvents = atStart ? 'none' : 'auto'; }
    });
    ['qNext','qNextBottom'].forEach(function(id) {
      var b = document.getElementById(id);
      if (b) { b.style.opacity = atEnd ? '0.3' : '1'; b.style.pointerEvents = atEnd ? 'none' : 'auto'; }
    });
    var counter = document.getElementById('qCounter');
    if (counter) counter.textContent = (idx + 1) + ' / ' + (total - pv + 1);
    buildDots(pv);
  }

  function buildDots(pv) {
    var c = document.getElementById('qDots');
    if (!c) return;
    var pages = total - pv + 1;
    if (c.children.length !== pages) {
      c.innerHTML = '';
      for (var i = 0; i < pages; i++) {
        var d = document.createElement('button');
        d.dataset.i = i;
        d.addEventListener('click', function() { idx = parseInt(this.dataset.i); update(); });
        c.appendChild(d);
      }
    }
    Array.from(c.children).forEach(function(d, i) {
      d.className = i === idx ? 'active' : '';
    });
  }

  document.getElementById('qNext').addEventListener('click', function() { if (idx < total - perView()) { idx++; update(); } });
  document.getElementById('qPrev').addEventListener('click', function() { if (idx > 0) { idx--; update(); } });
  document.getElementById('qNextBottom').addEventListener('click', function() { if (idx < total - perView()) { idx++; update(); } });
  document.getElementById('qPrevBottom').addEventListener('click', function() { if (idx > 0) { idx--; update(); } });
  window.addEventListener('resize', update);
  update();

  cards.forEach(function(c) { c.classList.add('fade'); if (inIframe) { c.classList.add('in'); } else { observer.observe(c); } });
})();

// iframe 內 anchor 連結修正：滾動到正確位置
if (inIframe) {
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var id = this.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// 學員見證輪播（翻頁式 + 文字計數器）
(function() {
  var track = document.getElementById('testiTrack');
  if (!track) return;
  var cards = track.querySelectorAll('.testi-card');
  var total = cards.length;
  var page = 0;
  var autoTimer;

  function perView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function totalPages() { return Math.ceil(total / perView()); }

  function goTo(p) {
    var pages = totalPages();
    page = ((p % pages) + pages) % pages;
    var pv = perView();
    var offset = page * pv;
    if (offset > total - pv) offset = total - pv;
    track.style.transform = 'translateX(-' + (offset * 100 / pv) + '%)';
    var counter = document.getElementById('testiDots');
    var start = offset + 1;
    var end = Math.min(offset + pv, total);
    if (counter) counter.textContent = '第 ' + start + ' – ' + end + ' 則，共 ' + total + ' 則見證（' + (page + 1) + ' / ' + pages + ' 頁）';
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function() { goTo(page + 1); }, 5000);
  }

  document.getElementById('testiNext').addEventListener('click', function() { goTo(page + 1); resetAuto(); });
  document.getElementById('testiPrev').addEventListener('click', function() { goTo(page - 1); resetAuto(); });
  window.addEventListener('resize', function() { goTo(page); });
  goTo(0);
  resetAuto();
})();

// 文章站內閱讀 Modal
(function() {
  var modal = document.getElementById('articleModal');
  var body = document.getElementById('articleModalBody');
  var source = document.getElementById('articleModalSource');
  if (!modal) return;

  var articles = {
    1: {
      title: '誠信與人品',
      url: 'https://www.ganjingworld.com/article/1h2hvr7vnil5CRdZgIX5tk5zF1ht1c',
      content: '<p>哈里斯是美國紐約市一家知名廣告公司的女高管，2010年8月的一天中午，她和朋友在一家餐廳吃飯。</p><p>中途，朋友想出去抽支菸，於是兩人一起走出餐廳，站在外邊的大街上。</p><p>這時過來一名流浪漢，對哈里斯囁嚅着自我介紹：「我叫瓦倫丁，今年32歲，已經失業3年了，只好靠乞討度日。我想說的是，不知您是否願意幫助我？比如，給我一點零錢，讓我買點生活必需品。」瓦倫丁說完後，用期盼的眼神望着哈里斯。</p><p>看着眼前這名年輕的黑人流浪漢，哈里斯動了惻隱之心，她微笑着對瓦倫丁說：「沒問題，我十分願意幫助你。」</p><p>就伸進口袋去掏錢，遺憾的是，身上卻沒有帶現金，只掏出一張沒有密碼的信用卡，這讓她有點尷尬，不知接下來該怎麼辦。</p><p>瓦倫丁看出了她的難爲情，小聲說：「如果您相信我，能將這張信用卡借我用用嗎？」</p><p>心地善良的哈里斯同意了，隨手將信用卡遞給了瓦倫丁。</p><p>拿到信用卡後，瓦倫丁並沒有馬上離開，又小聲問哈里斯：「我除了買些生活必需品外，還能用它再買包煙嗎？」</p><p>哈里斯未加思索地說：「完全可以，如果你還需要什麼，都可以用卡上的錢去買。」</p><p>瓦倫丁拿着那張沒有密碼的信用卡離開後，哈里斯和朋友重新回到了餐廳。</p><p>10分鐘後，哈里斯就感到了後悔，她懊喪地對朋友說：「那張信用卡不僅沒有設置密碼，裏面還有10萬美金，那個傢伙一定拿着信用卡跑掉了，這下我要倒大黴了。」</p><p>朋友也埋怨她：「你怎麼能隨隨便便相信一個陌生人？你呀，就是太善良。」</p><p>哈里斯再也沒心思吃飯了，在朋友付完賬後，兩人便默默走出了餐廳。</p><p>令他們意外的是，剛出餐廳大門，就發現流浪漢瓦倫丁已等候在外面。</p><p>他雙手將信用卡遞給哈里斯，很恭敬地將自己消費的數額一一報上：「我一共用卡消費了25美元，買了一些洗漱用品、兩桶水和一包煙，請您覈查一下。」</p><p>面對這位誠實守信的流浪漢，哈里斯和朋友在詫異的同時，更多的則是感動，她不由自主抓住瓦倫丁，連連說：「謝謝您，謝謝您！」</p><p>瓦倫丁一臉疑惑，她幫助了我，我應該感謝她纔是，她爲什麼卻要感謝我呢？</p><p>隨後，哈里斯便和朋友徑直去了《紐約郵報》，將發生的故事告訴了報社。《紐約郵報》也被瓦倫丁的誠實所感動，當即予以報道，頓時在社會上引起了巨大反響。報社不斷接到讀者的來信來電，都表示願意幫助瓦倫丁。</p><p>得克薩斯州一名叫伊德瑞斯·艾爾巴的商人看了報道後，便於第二天給瓦倫丁匯去了6000美元，以獎賞他的誠實。</p><p>更讓瓦倫丁驚喜的是，幾天後，他又接到威斯康星州航空公司的電話，表示願意招聘他擔任公司的空中服務員，並通知他儘快簽訂工作協議。</p><p>沉浸在巨大喜悅中的瓦倫丁感慨萬千：「從小母親就教育我，做人一定要誠實守信，即使身無分文流落街頭，也不能把誠信丟掉。我之所以能得到這麼多人的幫助，是因爲我始終相信，誠實的人總會有好報。」</p><p>親愛的朋友，也許是一時「腦子進水」了，也許是哈里斯善良過頭了，總之，她的這件「傻事」，讓我們有機會看到了瓦倫丁的誠信品格！</p><p>世界上永遠不缺投機取巧之人，而面對利益，誠實守信的人，卻總讓人萌生敬意。</p>'
    },
    2: {
      title: '如何激勵別人',
      url: 'https://www.ganjingworld.com/article/1h4jau0kq6q2tot2iBenPs3Vz1g51c',
      content: '<p>在「哈囉大樹教練」的社群，有同學問我一個問題：如何激勵別人？</p><p>大樹教練的回應如下：</p><p>如何激勵他人是一門功課，也是一項能力，把問題回歸本質，激勵自己才是關鍵，因為這是唯一的可控元素。</p><p>我們來拆解，激勵，緩和一點說，可以說成是鼓勵，人們都喜歡被鼓勵，因為這代表，肯定，認可，讚美，欣賞。多數來說這是愉悅的，因為被鼓勵的人，肯定已經是做了什麼，然後得到了鼓勵。或是說，他被鼓勵之後，也不用做什麼，只需要高興說，謝謝你的鼓勵，我會更努力，這也可以當作做為一種獎賞。</p><p>而激勵就不一樣了，這是要一個人去突破，去挑戰，去做一些超出平時能力以外的事，而他可能耽心自己能力不足，或是信心不夠，或是想要逃避，亦或這是須要付出代價，所以我們想要激勵他！讓他採取行動！</p><p>對，激勵最終要的就是：採取行動。</p><p>我想吃飯，睡覺，看電視，玩手機，這幾件事不用人激勵也會去做吧！</p><p>再把話題繞回來，你被拒絕過嗎？你為何被拒絕？因為你的提案或是建議對方沒有接受，對方為何沒有接受，因為這並不是對方想要的。</p><p>同樣的，不是說你想激勵別人，別人就一定接受你的激勵，對方為何沒有接受你的激勵？你的心意，善意及真心誠意？因為，每個人的激勵點不一樣，就像兔子要的是蘿蔔，魚要的是魚餌，馬吃的是草，猴子要的是香蕉，如果你給錯了，對方就沒有反應。</p><p>如何學習激勵他人呢？不妨你可以問自己，什麼事情最讓你感到興奮？最迫不及待想要去完成？那就是你的激勵點。</p><p>記住，你的點，不一定是別人的點，所以你要激勵他人，就要問當事人，一樣的問題：什麼事情，最讓你感到有動力，想到就興奮，迫不及待的就想去做？這大概就是對方的激勵點了。</p><p>若是要精準，當然還有後續的問句，但就不在此多做說明了。若是教練有開課，歡迎來學習，這是一門學問，也是一項能力，是可以被學習的。</p>'
    },
    3: {
      title: '令人回味的經典問答',
      url: 'https://www.ganjingworld.com/article/1h12753c9gq77W8zRDUFbRQsb1ml1c',
      content: '<p>以下我們來欣賞幾段經典的問答：</p><p>一位訪者問方丈：「您在公眾場合是素食，您一個人在房間會不會吃肉呢？」方丈反問他：「您是開車來的嗎？」訪者：「是的。」方丈說：「開車要繫安全帶。請問您是為自己繫還是為交警繫？如果是為自己繫，有沒有交警是不是都要繫。」訪者：「喔，我明白了！」</p><p><strong>反思：</strong>好多人說沒人督促就不能堅持。我想看完這個故事就知道其實還是自己不夠想改變！</p><p>訪者：「請問方丈，我的小孩不聽話、不愛學習怎麼辦？」方丈：「您影印過文件嗎？」訪者：「影印過。」方丈：「如果影印件上面有錯字，您是改影印件還是改原稿？」訪者：「改原稿。」</p><p><strong>反思：</strong>父母是原稿，家庭是影印機，孩子是影印件。孩子是父母的未來，父母更是孩子的未來。</p><p>訪者說：「為什麼我努力了還是得不到？燒香拜佛了但命運卻不變？」方丈：「我給你寄五百塊錢，請你幫我辦一件事好不好？」訪者：「方丈，您說辦什麼，我絕對幫你辦好！」方丈：「幫我買一輛汽車。」訪者驚訝的說：「方丈，五百塊怎麼能買到汽車呢？！」方丈：「你知道五百塊買不到汽車！可是世上有太多的人都在絞盡腦汁，想付出一點，就得到很多。」</p><p><strong>反思：</strong>付出跟收獲不在同一個季節，春天播種之後，還要經過一連串的付出，秋天才能有收成。而許多人一點付出就想要有回報。</p><p>一位訪者不停地述說自己的苦難。方丈打斷她的話說：「你的苦還真多呀！」訪者：「別人訴苦最多需要三天三夜，我訴苦需要三年！」方丈：「那是什麼時候的事情？」訪者：「前幾年。」方丈：「那不是過去了嗎？為什麼還緊抓不放呢？」訪者：「不說心裡難受呀。」方丈：「你拉出的糞便臭不臭？」訪者：「當然很臭啦！」方丈：「現在糞便在哪裡呢？」訪者：「拉完就沖掉了。」方丈：「為什麼不把它包起來放在身上？見到人就拿出來告訴別人這東西臭得我難受？」訪者：「那多噁心！」方丈：「對呀！苦難也是一樣，它已經過去了。回憶和訴苦就如同把糞便拿出來向人展示，既臭自己又臭別人！」</p><p><strong>反思：</strong>昨天逝去無回，明天還沒來臨，最好的就是活在當下。</p><p>訪者說：「如果世人都像你一樣都出家，人類還能延續嗎？」方丈：「你的小孩多大了？男孩女孩？」訪者：「17歲了，女孩。」方丈：「要準備考大學了。」訪者：「是的，正在加緊復習。」方丈：「你一定希望她考個好大學吧？」訪者：「是的，要考就考一流的大學，其他的大學沒什麼意思。」方丈：「如果每一個人都像你一樣想，那還有人種田嗎？其他的大學不是只有都關門了？」</p><p><strong>反思：</strong>存在就有它的道理，人總是喜歡用自己的觀點看問題。而世界並不會因為你是什麼觀點而有所改變。</p>'
    },
    4: {
      title: '一語點醒，直指人心',
      url: 'https://www.ganjingworld.com/article/1h1dorjefkd1TtjypM9fPFma71vi1c',
      content: '<p>很久以前，有個求道的年輕人，為了追求真理，不辭辛勞，長年累月地跋山涉水到各地去探訪有道之士。時間一天天過去了，他也求教了很多人，但總覺得自己一點收穫都沒有，完全找不到他想追尋的真理。他很失望，想來想去，怎麼也想不出到底為甚麼會這樣？</p><p>後來，他聽一位私塾先生說，在離他家鄉不遠的南山裏，有位得道的高僧，能解答關於人生的各種疑難問題。於是，他連夜起程，沿途探詢這位高僧的住處。</p><p>一日，年輕人來到南山腳下，看見一個樵夫擔了一擔柴從山上下來，便上前詢問：「樵夫大哥，你知不知道這南山上是否住著一位得道高僧？住在哪裏？長什麼樣子？」</p><p>樵夫想了一下說：「這山上確實有位得道高僧，但沒有人知道他住在哪裏，因為他常常四處雲遊，度化世人。至於他的相貌，有人說他面貌慈悲安詳；也有人說他蓬頭垢面，不修邊幅。沒有人能說得清楚。」</p><p>年輕人謝過樵夫，他下定決心尋訪高僧，便不顧一切地往深山裏走。一路上，他又遇見了農夫、獵戶、牧童、採藥人等等，就是一直沒有找到他心目中那位可以指點人生迷津的高僧。</p><p>絕望之下，他只好回頭下山。在路上遇見一個拿著破碗的乞丐，向他討水喝。年輕人把背在身上的水袋拿下來，倒了一些水在碗裏。可是，還沒等乞丐喝到水，水就流光了；沒辦法，年輕人又倒了些水在碗裏，叫乞丐趕快喝。可是，碗才剛端到乞丐嘴邊，水又流光了。</p><p>「你拿個破碗怎麼盛水？怎麼用它來解渴？」年輕人不耐煩地說道。</p><p>「可憐的人，你到處請教人生的道理，表面上謙虛。但你在心中判斷別人的話是否合你的心意；你不能接納不合你意的說法，這些成見在你的心中造成了很大的漏洞，使你永遠無法得到答案。」</p><p>年輕人一聽恍然大悟，連忙作揖問道：「大師可就是我要尋找的高僧？」年輕人連問幾次都沒有回應，抬起頭時，那乞丐早已不見蹤影。</p><p>世上總有一些人抱著成見的漏洞不放，對近在身邊的真理視而不見，最終和真理擦肩而過。</p><p>關於摒棄成見、打破先入為主的觀念，下面這個故事也許會給我們一些啟發。</p><p><strong>打開心中的鎖</strong></p><p>一代魔術大師胡汀尼有一手絕活，他能在極短的時間內打開無論多麼複雜的鎖，逃生出來，從未失手。英國一個小鎮的居民，決定向胡汀尼挑戰，他們特製了一個堅固的鐵牢，配上非常複雜的鎖。</p><p>最終，胡汀尼在兩小時後終未打開這把鎖，他筋疲力盡地將身體靠在門上坐下來，結果牢門卻順勢而開──原來，牢門根本沒有上鎖！</p><p>大師的失敗在於，他先入為主的觀念告訴他：只要是鎖，就一定是鎖上的。</p>'
    },
    feather: {
      title: '羽毛珍惜條款',
      feather: true,
      content: '<p>天道酬勤；商道酬信<br>我們因為勤勞與誠信<br>擁有了客戶與朋友的信任</p><p>珍惜商譽；責無旁貸<br>你的品德就是你的品牌<br>你要相信你的品牌價值千萬</p><p>人與人之間的合作<br>就是品牌與品牌的合作<br>強強聯手能創造浪潮<br>弱弱合作也能創造奇蹟<br>強弱協作也能獨樹一格</p><p>我們唯一無法接受的事情<br>就是合作的夥伴做了<br>違反道德、善良風俗的事情</p><p>我們知道只要持續成長<br>沒有永遠不犯錯的人<br>錯了就改，改就改到對</p><p>然而，有些錯不能犯<br>因為，信任就像一張紙<br>一旦，弄皺了很難再撫平</p><p class="feather-sub">什麼是破壞信任的行為？</p><ol class="feather-list"><li>違反善良風俗</li><li>違反誠信原則</li><li>傷害他人行為</li></ol><p>珍惜羽毛，才能結群高飛<br>因此，合作之前，要願意<br>遵守『羽毛珍惜條款』</p><p class="feather-sub">違反『羽毛珍惜條款』者：</p><ol class="feather-list"><li>自願退出合作計劃，放棄一切權益。</li><li>需登全國性報紙聲明，自行承擔責任。</li><li>需對受傷害的人表態，並承諾盡力捥回損失。</li></ol><p class="feather-sign">日期　　　　　　　　　　　　　簽署人</p>'
    }
  };

  function openArticle(id) {
    var a = articles[id];
    if (!a) return;
    body.innerHTML = '<h2>' + a.title + '</h2>' + a.content;
    body.classList.toggle('feather-modal-body', !!a.feather);
    source.innerHTML = a.url ? '<a href="' + a.url + '" target="_blank">原文出處：乾淨世界 →</a>' : '';
    modal.classList.add('open');
    modal.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  document.querySelectorAll('.article-card[data-article]').forEach(function(card) {
    card.addEventListener('click', function() {
      openArticle(this.dataset.article);
    });
  });

  ['featherCovenantBtn', 'featherLinkInline'].forEach(function(bid) {
    var el = document.getElementById(bid);
    if (el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        openArticle('feather');
      });
    }
  });

  document.getElementById('articleModalClose').addEventListener('click', function() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  });

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

// 最新消息輪播（翻頁式，比照學員見證）
(function() {
  var track = document.getElementById('newsTrack');
  if (!track) return;
  var cards = track.querySelectorAll('.news-card');
  var total = cards.length;
  var page = 0;

  function perView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function totalPages() { return Math.ceil(total / perView()); }

  function goTo(p) {
    var pages = totalPages();
    page = ((p % pages) + pages) % pages;
    var pv = perView();
    var offset = page * pv;
    if (offset > total - pv) offset = total - pv;
    track.style.transform = 'translateX(-' + (offset * 100 / pv) + '%)';
    var counter = document.getElementById('newsCounter');
    var start = offset + 1;
    var end = Math.min(offset + pv, total);
    if (counter) counter.textContent = '第 ' + start + ' – ' + end + ' 場，共 ' + total + ' 場（' + (page + 1) + ' / ' + pages + ' 頁）';
  }

  document.getElementById('newsNext').addEventListener('click', function() { goTo(page + 1); });
  document.getElementById('newsPrev').addEventListener('click', function() { goTo(page - 1); });
  window.addEventListener('resize', function() { goTo(page); });
  goTo(0);
})();
