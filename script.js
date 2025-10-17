/* Shared JS for site (rooms generation, modal, WhatsApp, directions, social links) */
const whatsappNumber = "27826672020"; // no +

const FLOORS = ["A","B","C","D","E","F"];
const ROOMS = [];

function placeholderImageLocal(id){
  // Prefer local assets if available
  return `assets/rooms/${id}.jpg`;
}

(function generateRooms(){
  for(const floor of FLOORS){
    for(let i=1;i<=7;i++){
      const id = `${floor}${i}`;
      const isFamily = (i === 7);
      const hasBathroom = !(floor === "F" && (i === 6 || i === 7));
      const extras = floor === "C" ? ["Fridge","Heater"] : [];
      let price = { p2:null, p3:null, night:null };

      if(isFamily){
        price = { p2:null, p3:null, night:850 };
      } else if (floor === "D"){
        price = { p2:180, p3:250, night:450 };
      } else if (floor === "C"){
        price = { p2:150, p3:200, night:350 };
      } else if (floor === "F"){
        price = { p2:150, p3:200, night:300 };
        if(i === 6) price.night = 250;
      } else {
        price = { p2:150, p3:200, night:300 };
      }

      const photo = placeholderImageLocal(id);
      ROOMS.push({ id, floor, number:i, isFamily, hasBathroom, extras, price, photo });
    }
  }
})();

function openWhatsApp(msg){
  const tx = encodeURIComponent(msg);
  window.open(`https://wa.me/${whatsappNumber}?text=${tx}`,'_blank');
}

function openSocial(url){
  window.open(url,'_blank');
}

function openDirections(){
  const address = encodeURIComponent('Miraton Lodge Hotel, 19 Natal Street, Johannesburg');
  const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
  window.open(url,'_blank');
}

document.addEventListener('DOMContentLoaded', ()=>{

  document.querySelectorAll('#headerTalk').forEach(btn=>btn.addEventListener('click', ()=> openWhatsApp('Hello Miraton Lodge 👋 I have a general enquiry.')));

  if(document.body.id === 'page-home'){
    const preview = document.getElementById('previewGrid');
    const featured = ROOMS.filter(r => !r.isFamily).slice(0,6);
    featured.forEach(room=>{
      const card = document.createElement('div');
      card.className = 'preview-card';
      card.innerHTML = `
        <div class="room-media"><img src="${room.photo}" alt="Room ${room.id}" loading="lazy"></div>
        <div class="meta">
          <h4>Room ${room.id}</h4>
          <p>${room.isFamily ? 'Family Room' : 'Standard Room'}${room.extras.length ? ' · '+room.extras.join(', ') : ''}</p>
          <div class="price">Night: R ${room.price.night || '—'}</div>
          <div style="margin-top:10px;display:flex;gap:8px">
            <a class="btn-primary" href="rooms.html">View</a>
            <button class="btn-outline" onclick='openWhatsApp("Hello Miraton Lodge 👋 I am enquiring about room ${room.id}.")'>Enquire</button>
          </div>
        </div>
      `;
      preview.appendChild(card);
    });
  }

  if(document.body.id === 'page-rooms'){
    const floorSelect = document.getElementById('floorSelect');
    FLOORS.forEach(f=>{ const o=document.createElement('option'); o.value=f; o.textContent='Floor '+f; floorSelect.appendChild(o); });
    const roomsGrid = document.getElementById('roomsGrid');
    const searchInput = document.getElementById('searchInput');

    function renderRooms(){
      roomsGrid.innerHTML = '';
      const floor = floorSelect.value;
      const q = (searchInput.value||'').trim().toLowerCase();
      const list = ROOMS.filter(r => (floor === 'All' || r.floor === floor) && (r.id.toLowerCase().includes(q) || r.extras.join(' ').toLowerCase().includes(q)));
      if(list.length === 0){ roomsGrid.innerHTML = '<div style="color:var(--text-muted);padding:20px">No rooms found.</div>'; return; }
      list.forEach(room=>{
        const card=document.createElement('article'); card.className='room-card';
        card.innerHTML = `
          <div class="room-media"><img src="${room.photo}" alt="Room ${room.id}" loading="lazy"></div>
          <div class="room-body">
            <div class="room-title">
              <h3>Room ${room.id}</h3>
              <div><div style="font-weight:700">${room.price.night ? 'R '+room.price.night : '—'}</div><div style="font-size:12px;color:var(--text-muted)">${room.hasBathroom ? 'Ensuite' : 'No bathroom in room'}</div></div>
            </div>
            <p>${room.isFamily ? 'Family Room — ideal for a full-night stay only.' : 'Standard Room — Queen bed.'}</p>
            <p class="room-meta">${room.extras.length ? 'Extras: '+room.extras.join(', ') : ''}</p>
            <div class="room-actions">
              <button class="btn-reserve">Reserve</button>
              <button class="btn-talk">Talk to us</button>
            </div>
          </div>
        `;
        card.querySelector('.btn-talk').addEventListener('click', (e)=>{ e.stopPropagation(); openWhatsApp(`Hello Miraton Lodge 👋 I am enquiring about room ${room.id}.`); });
        card.querySelector('.btn-reserve').addEventListener('click', (e)=>{ e.stopPropagation(); openBookingModal(room); });
        roomsGrid.appendChild(card);
      });
    }

    renderRooms();
    floorSelect.addEventListener('change', renderRooms);
    searchInput.addEventListener('input', renderRooms);

    // modal
    const modal = document.getElementById('bookingModal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');
    function openBookingModal(room){
      modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
      modalBody.innerHTML = `
        <h3>Reserve ${room.id}</h3>
        <p style="color:var(--text-muted)">Rates: ${room.price.p2 ? '2h R'+room.price.p2+' · ' : ''}${room.price.p3 ? '3h R'+room.price.p3+' · ' : ''}${room.price.night ? 'Night R'+room.price.night : ''}</p>
        <div class="field"><label>Date</label><input type="date" id="bkDate" /></div>
        <div class="field"><label>Duration</label><select id="bkDuration">${room.price.p2 ? "<option value='2 hours'>2 hours</option>" : ''}${room.price.p3 ? "<option value='3 hours'>3 hours</option>" : ''}${room.price.night ? "<option value='Full night'>Full night</option>" : ''}</select></div>
        <div class="field"><label>Your name</label><input id="bkName" type="text" placeholder="Full name" /></div>
        <div class="field"><label>Your phone</label><input id="bkPhone" type="text" placeholder="Phone number" /></div>
        <div class="modal-actions"><button id="createReservation" class="btn-reserve">Create Reservation (demo)</button><button id="sendWhats" class="btn-talk">Send via WhatsApp</button></div>
        <p style="margin-top:16px;color:var(--text-muted);font-size:0.9rem">Front-end demo: no payment yet. Use WhatsApp to confirm.</p>
      `;
      document.getElementById('createReservation').onclick = ()=>{ alert(`Reservation (demo) created for room ${room.id}. Please confirm via WhatsApp.`); };
      document.getElementById('sendWhats').onclick = ()=>{
        const name = document.getElementById('bkName').value || '(name)';
        const phone = document.getElementById('bkPhone').value || '(phone)';
        const date = document.getElementById('bkDate').value || '(date)';
        const duration = document.getElementById('bkDuration').value || '(duration)';
        const msg = `Hello Miraton Lodge 👋%0AI'd like to reserve room ${room.id}.%0AName: ${name}%0APhone: ${phone}%0ADate: ${date}%0ADuration: ${duration}`;
        window.open(`https://wa.me/${whatsappNumber}?text=${msg}`,'_blank');
      };
    }
    closeModal.addEventListener('click', ()=>{ modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); });
    window.addEventListener('click', (e)=>{ if(e.target === modal){ modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); } });
  }

  if(document.body.id === 'page-contact'){
    const btnContactWhats = document.getElementById('contactWhatsApp');
    if(btnContactWhats) btnContactWhats.addEventListener('click', ()=> openWhatsApp('Hello Miraton Lodge 👋 I would like to make a reservation / enquiry.'));
  }

});