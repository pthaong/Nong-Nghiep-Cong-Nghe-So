// AgriSmart module: admin
// Các hàm dưới đây được tách trực tiếp từ app.js đang chạy.
// Module này dùng chung DOM/state của ứng dụng hiện tại.

function toggleUserStatus(id){
  const u = DB.users.find(x=>x.id===id);
  u.status = u.status==='active' ? 'locked' : 'active';
  saveDB(); renderAdminUsers();
}

function renderAdminFields(){
  document.getElementById('adminFieldsTable').innerHTML = DB.fields.map(f=>{
    const owner = DB.users.find(u=>u.id===f.ownerId);
    return `<tr><td class="fw-semibold">${f.name}</td><td>${f.crop}</td><td>${f.area} ha</td><td><span class="chip chip-ok">${f.stage}</span></td><td>${f.plantDate}</td><td>${owner?owner.name:'—'}</td></tr>`;
  }).join('') || `<tr><td colspan="6">${emptyHTML('Chưa có dữ liệu ruộng nào.')}</td></tr>`;
}

function renderAdminPrices(){
  document.getElementById('adminPricesTable').innerHTML = DB.prices.map((p,i)=>`
    <tr><td class="fw-semibold">${p.crop}</td>
    <td><input type="number" class="form-control form-control-sm" style="width:110px" value="${p.price}" onchange="updatePrice(${i}, this.value)"></td>
    <td>${p.unit}</td>
    <td><input type="number" step="0.1" class="form-control form-control-sm" style="width:90px" value="${p.change}" onchange="updatePriceChange(${i}, this.value)"></td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="deletePrice(${i})"><i class="bi bi-trash"></i></button></td></tr>`).join('');
}

function deletePrice(i){ DB.prices.splice(i,1); saveDB(); renderAdminPrices(); }
