
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const money = n => '$' + Number(n).toFixed(0);
  const CART_KEY = 'shopco-cart-v1';
  let products = [];
  let currentPage = 1;
  const pageSize = 6;
  const cartRead = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } };
  const cartWrite = items => { localStorage.setItem(CART_KEY, JSON.stringify(items)); updateCartCount(); };
  const updateCartCount = () => { const el=$('#cart-count'); if(el) el.textContent=cartRead().reduce((n,x)=>n+x.quantity,0); };
  const stars = rating => `<div class="rating" aria-label="${rating} out of 5">${'★'.repeat(Math.floor(rating))}${rating%1?'½':''}${'☆'.repeat(Math.max(0,5-Math.ceil(rating)))} <span>${rating}/5</span></div>`;
  const productCard = p => `<article class="product-card"><a class="product-image" href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy"></a><h3><a href="product.html?id=${p.id}">${p.name}</a></h3>${stars(p.rating)}<div class="price">${money(p.price)} ${p.oldPrice?`<span class="old-price">${money(p.oldPrice)}</span><span class="sale-badge">-${Math.round((1-p.price/p.oldPrice)*100)}%</span>`:''}</div></article>`;
  function addToCart(id, quantity=1, color='', size='M') {
    const p=products.find(x=>x.id===Number(id)); if(!p) return;
    const cart=cartRead(); const existing=cart.find(x=>x.id===p.id && x.color===color && x.size===size);
    if(existing) existing.quantity=Math.min(99,existing.quantity+quantity);
    else cart.push({id:p.id,quantity:Math.min(99,quantity),color,size});
    cartWrite(cart);
  }
  function renderHome(){
    const newGrid=$('#new-arrivals-grid'), topGrid=$('#top-selling-grid');
    if(newGrid) newGrid.innerHTML=products.slice(0,4).map(productCard).join('');
    if(topGrid) topGrid.innerHTML=[...products].sort((a,b)=>b.rating-a.rating).slice(0,4).map(productCard).join('');
    const related=$('#related-grid'); if(related) related.innerHTML=products.slice(0,4).map(productCard).join('');
  }
  function renderCategory(){
    const grid=$('#category-grid'); if(!grid)return;
    const params=new URLSearchParams(location.search);
    const categoryBox=$('#category-options');
    const categories=['All','T-shirts','Shirts','Jeans','Shorts'];
    categoryBox.innerHTML=categories.map(c=>`<button data-category="${c}" class="${(params.get('category')||'All')===c?'active':''}">${c}<span>›</span></button>`).join('');
    let selectedCategory=params.get('category')||'All', selectedSize='';
    const apply=()=>{
      let list=products.filter(p=>(selectedCategory==='All'||p.category===selectedCategory)&&p.price>=Number($('#min-price').value||0)&&p.price<=Number($('#max-price').value||99999)&&(!selectedSize||p.sizes.includes(selectedSize)));
      const sort=$('#sort-products').value;
      if(sort==='price-low')list.sort((a,b)=>a.price-b.price);
      if(sort==='price-high')list.sort((a,b)=>b.price-a.price);
      if(sort==='rating')list.sort((a,b)=>b.rating-a.rating);
      const pages=Math.max(1,Math.ceil(list.length/pageSize)); currentPage=Math.min(currentPage,pages);
      $('#catalog-title').textContent=selectedCategory==='All'?'Casual':selectedCategory;
      $('#results-count').textContent=`Showing ${list.length?((currentPage-1)*pageSize+1):0}–${Math.min(currentPage*pageSize,list.length)} of ${list.length} Products`;
      $('#page-number').textContent=`Page ${currentPage} of ${pages}`;
      $('#previous-page').disabled=currentPage===1; $('#next-page').disabled=currentPage===pages;
      grid.innerHTML=list.slice((currentPage-1)*pageSize,currentPage*pageSize).map(productCard).join('')||'<div class="no-results">No products match these filters. Try changing your selection.</div>';
    };
    categoryBox.addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;selectedCategory=b.dataset.category;currentPage=1;$$('button',categoryBox).forEach(x=>x.classList.toggle('active',x===b));apply();});
    $('#size-filters').addEventListener('click',e=>{const b=e.target.closest('[data-size]');if(!b)return;selectedSize=selectedSize===b.dataset.size?'':b.dataset.size;$$('button',$('#size-filters')).forEach(x=>x.classList.toggle('active',x.dataset.size===selectedSize));currentPage=1;apply();});
    $('#apply-filters').addEventListener('click',()=>{currentPage=1;apply();});
    $('#reset-filters').addEventListener('click',()=>{$('#min-price').value=0;$('#max-price').value=300;selectedCategory='All';selectedSize='';currentPage=1;$('#sort-products').value='popular';$$('button',categoryBox).forEach(x=>x.classList.toggle('active',x.dataset.category==='All'));$$('button',$('#size-filters')).forEach(x=>x.classList.remove('active'));apply();});
    $('#sort-products').addEventListener('change',()=>{currentPage=1;apply();});
    $('#previous-page').addEventListener('click',()=>{currentPage=Math.max(1,currentPage-1);apply();});
    $('#next-page').addEventListener('click',()=>{currentPage++;apply();});
    apply();
  }
  function renderProduct(){
    const host=$('#product-detail'); if(!host)return;
    const p=products.find(x=>x.id===Number(new URLSearchParams(location.search).get('id'))) || products[0];
    if(!p){host.innerHTML='<p>Product not found.</p>';return;}
    $('#product-breadcrumb').textContent=p.name;
    let qty=1, color=p.colors[0], size='M';
    host.innerHTML=`<div class="detail-image"><img src="${p.image}" alt="${p.name}"></div><div class="detail-copy"><p class="muted">${p.category}</p><h1>${p.name}</h1>${stars(p.rating)}<div class="price">${money(p.price)} ${p.oldPrice?`<span class="old-price">${money(p.oldPrice)}</span>`:''}</div><p>${p.description}</p><hr><div class="option-label">Select Color</div><div class="swatches">${p.colors.map((c,i)=>`<button class="swatch ${i===0?'active':''}" style="background:${c}" data-color="${c}" aria-label="Color ${c}"></button>`).join('')}</div><div class="option-label">Choose Size</div><div class="detail-sizes">${p.sizes.map((s,i)=>`<button class="${i===1?'active':''}" data-size="${s}">${s}</button>`).join('')}</div><div class="buy-row"><div class="quantity"><button id="qty-minus" aria-label="Decrease quantity">−</button><strong id="qty-value">1</strong><button id="qty-plus" aria-label="Increase quantity">+</button></div><button class="btn" id="add-to-cart">Add to Cart</button></div><p id="add-message" role="status"></p></div>`;
    $$('.swatch',host).forEach(b=>b.addEventListener('click',()=>{color=b.dataset.color;$$('.swatch',host).forEach(x=>x.classList.toggle('active',x===b));}));
    $$('.detail-sizes button',host).forEach(b=>b.addEventListener('click',()=>{size=b.dataset.size;$$('.detail-sizes button',host).forEach(x=>x.classList.toggle('active',x===b));}));
    $('#qty-minus').addEventListener('click',()=>{qty=Math.max(1,qty-1);$('#qty-value').textContent=qty;});
    $('#qty-plus').addEventListener('click',()=>{qty=Math.min(99,qty+1);$('#qty-value').textContent=qty;});
    $('#add-to-cart').addEventListener('click',()=>{addToCart(p.id,qty,color,size);$('#add-message').textContent='Added to your cart.';});
  }
  function renderCart(){
    const host=$('#cart-items'); if(!host)return;
    let cart=cartRead(), promo=0;
    const draw=()=>{
      cart=cartRead();
      if(!cart.length) host.innerHTML='<p class="empty-cart">Your cart is empty. <a href="category.html">Start shopping</a></p>';
      else host.innerHTML=cart.map(item=>{const p=products.find(x=>x.id===item.id);if(!p)return '';return `<article class="cart-item" data-id="${p.id}" data-color="${item.color||''}" data-size="${item.size||'M'}"><img src="${p.image}" alt="${p.name}"><div><h3><a href="product.html?id=${p.id}">${p.name}</a></h3><p>Color: ${item.color||'Default'}</p><p>Size: ${item.size||'M'}</p><div class="cart-item-bottom"><strong>${money(p.price)}</strong><div class="cart-qty"><button data-action="minus" aria-label="Decrease">−</button><b>${item.quantity}</b><button data-action="plus" aria-label="Increase">+</button></div></div></div><button class="remove-item" data-action="remove" aria-label="Remove ${p.name}">🗑</button></article>`;}).join('');
      const subtotal=cart.reduce((sum,item)=>sum+(products.find(p=>p.id===item.id)?.price||0)*item.quantity,0);
      const discount=Math.round(subtotal*promo/100), delivery=cart.length?15:0;
      $('#subtotal').textContent=money(subtotal);$('#discount-label').textContent=`(-${promo}%)`;$('#discount-total').textContent='-'+money(discount);$('#delivery-fee').textContent=money(delivery);$('#grand-total').textContent=money(subtotal-discount+delivery);
      $('#checkout-button').disabled=!cart.length;$('#checkout-button').style.opacity=cart.length?1:.5;
    };
    host.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const itemEl=b.closest('.cart-item');const item=cart.find(x=>x.id===Number(itemEl.dataset.id)&&String(x.color||'')===itemEl.dataset.color&&String(x.size||'M')===itemEl.dataset.size);if(!item)return;if(b.dataset.action==='minus')item.quantity=Math.max(1,item.quantity-1);if(b.dataset.action==='plus')item.quantity=Math.min(99,item.quantity+1);if(b.dataset.action==='remove')cart=cart.filter(x=>x!==item);cartWrite(cart);draw();});
    $('#promo-form').addEventListener('submit',e=>{e.preventDefault();const code=$('#promo-code').value.trim().toUpperCase();const msg=$('#promo-message');if(code==='SHOP20'){promo=20;msg.textContent='Promo code applied: 20% off.';msg.style.color='green';}else if(code==='SHOP30'){promo=30;msg.textContent='Promo code applied: 30% off.';msg.style.color='green';}else{promo=0;msg.textContent='Invalid code. Try SHOP20 or SHOP30.';msg.style.color='#f33';}draw();});
    $('#checkout-button').addEventListener('click',()=>{if(cart.length)alert('Demo checkout: your cart is ready. Connect a payment provider to accept real orders.');});
    draw();
  }
  function setupShared(){
    updateCartCount();
    $('#close-announcement')?.addEventListener('click',()=>$('#announcement')?.remove());
    $('#menu-toggle')?.addEventListener('click',()=>$('#main-nav')?.classList.toggle('open'));
    $('#search-form')?.addEventListener('submit',e=>{e.preventDefault();const q=$('#search-input').value.trim();location.href='category.html'+(q?'?q='+encodeURIComponent(q):'');});
    const newsletter=$('#newsletter-form');newsletter?.addEventListener('submit',e=>{e.preventDefault();$('#newsletter-message').textContent='Thanks for subscribing!';newsletter.reset();});
  }
  async function init(){
    setupShared();
    try{const response=await fetch('data.json');if(!response.ok)throw new Error('Could not load data.json');products=await response.json();}
    catch(err){const main=$('main');if(main)main.insertAdjacentHTML('afterbegin','<p class="data-error">Products could not load. Open this project using VS Code Live Server or another local web server (not file://).</p>');console.error(err);return;}
    const q=new URLSearchParams(location.search).get('q');
    if(q && $('#category-grid')){const input=$('#search-input');if(input)input.value=q;const grid=$('#category-grid');}
    if(location.pathname.endsWith('category.html')&&q){const query=q.toLowerCase();const filtered=products.filter(p=>p.name.toLowerCase().includes(query)||p.category.toLowerCase().includes(query));const grid=$('#category-grid');$('#catalog-title').textContent='Search results';$('#results-count').textContent=`${filtered.length} products found`;grid.innerHTML=filtered.map(productCard).join('')||'<div class="no-results">No products found.</div>'; }
    else renderCategory();
    renderHome();renderProduct();renderCart();
  }
  document.addEventListener('DOMContentLoaded',init);
 })();
