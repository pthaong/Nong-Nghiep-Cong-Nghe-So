/* AgriSmart AI Service
 * Local context-aware engine + optional backend hook.
 * Set window.AGRISMART_AI_API_URL to connect a real AI backend later.
 */
window.AgriAI = (() => {
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();}
  function context(){
    const u=window.currentUser ? window.currentUser() : null;
    const field=window.myFields ? window.myFields()[0] : null;
    return {u,field,weather:window.DB?.weather||null};
  }
  function localAnswer(message){
    const q=norm(message), c=context(), w=c.weather, f=c.field;
    const province=window.getProvinceShortName?.(c.u?.regionCode) || 'khu vực của bạn';
    if(!q) return 'Bạn hãy nhập câu hỏi về cây trồng, thời tiết, sâu bệnh, tưới nước, bón phân hoặc mùa vụ.';
    if(/xin chao|hello|chao/.test(q)) return `Chào bạn! Tôi là AgriSmart AI. Tôi đang theo dõi ${province}. Bạn có thể hỏi tôi về thời tiết, sâu bệnh, tưới nước, bón phân hoặc mùa vụ.`;
    if(/thoi tiet|mua|nhiet do|gio|do am/.test(q) && w){
      const rain=w.current.rain>=50?'Khả năng mưa khá cao, nên tránh phun/bón ngay trước mưa.':'Khả năng mưa hiện không cao.';
      return `Tại ${province}, hiện khoảng ${w.current.temp}°C, cảm giác ${w.current.feels}°C, độ ẩm ${w.current.humidity}%, gió ${w.current.wind} km/h. ${rain}`;
    }
    if(/tuoi|tuoi nuoc|thieu nuoc/.test(q)){
      return `Với ${f?.crop||'cây trồng của bạn'}, nên kiểm tra độ ẩm đất trước khi tưới. Ưu tiên tưới vào sáng sớm hoặc chiều mát và tránh tưới khi dự báo mưa lớn. Nếu là lúa giai đoạn đẻ nhánh, có thể duy trì mực nước nông thay vì để ngập sâu.`;
    }
    if(/bon phan|phan bon|dam|kali|npk/.test(q)){
      return `Không nên quyết định lượng phân chỉ từ một câu hỏi. Hãy dựa vào giai đoạn sinh trưởng, tình trạng đất và thời tiết. Nếu khu vực đang có mưa lớn, nên tránh bón ngay trước mưa để giảm nguy cơ rửa trôi.`;
    }
    if(/benh|sau|ray|nam|vàng la|vang la|dom|heo|thoi re/.test(q)){
      return `Bạn hãy cho tôi biết loại cây, triệu chứng cụ thể và thời điểm xuất hiện. Nếu có thể, hãy chuyển sang tab “Chẩn đoán bệnh” và tải ảnh lá/cây lên. Tôi sẽ đối chiếu với các dấu hiệu đã biết và đưa ra hướng xử lý tham khảo.`;
    }
    if(/gia|nong san|thi truong/.test(q)){
      const top=(window.DB?.prices||[]).slice(0,3).map(p=>`${p.crop}: ${p.price.toLocaleString('vi-VN')}đ/${p.unit.replace('đ/','')}`).join('; ');
      return `Một số mức giá đang có trong AgriSmart: ${top||'chưa có dữ liệu'}. Giá trong bản demo là dữ liệu tham khảo của hệ thống, không phải báo giá giao dịch thực tế.`;
    }
    if(/ruong|mua vu|cay trong/.test(q) && f){
      return `Ruộng gần nhất của bạn là “${f.name}”, đang trồng ${f.crop}, diện tích ${f.area} ha, giai đoạn ${f.stage}. Bạn có thể hỏi tiếp: “nên tưới thế nào?”, “có nên bón phân không?” hoặc “nguy cơ bệnh gì?”`;
    }
    return `Tôi đã ghi nhận câu hỏi của bạn. Để tư vấn sát hơn, hãy nêu 3 thông tin: loại cây, giai đoạn sinh trưởng và triệu chứng/thời tiết hiện tại. Ví dụ: “Lúa OM5451 đang đẻ nhánh, 2 ngày nay mưa nhiều, có nên bón phân không?”`;
  }
  async function analyzeImage(payload){
    const endpoint=window.AGRISMART_VISION_API_URL;
    if(endpoint && payload.imageData){
      try{
        const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
        if(r.ok){ const data=await r.json(); if(data.name || data.diagnosis || data.answer) return data; }
      }catch(e){ console.warn('Vision backend unavailable:',e); }
    }
    return {fallback:true, note:'Chế độ demo: ảnh đã được nhận ở giao diện. Để nhận diện bệnh trực tiếp từ pixel ảnh cần kết nối mô hình Computer Vision/backend.'};
  }
  async function chat(message){
    const endpoint=window.AGRISMART_AI_API_URL;
    if(endpoint){
      try{
        const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,context:context()})});
        if(r.ok){const data=await r.json(); if(data.answer) return {answer:data.answer,source:'AI backend'};}
      }catch(e){console.warn('AI backend unavailable:',e);}
    }
    return {answer:localAnswer(message),source:'AgriSmart AI · chế độ demo'};
  }
  return {chat, analyzeImage};
})();
