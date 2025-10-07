// SHARE JS ========================================================================== 



(function(){
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const ids = {
    fb: 'shareFacebook',
    tw: 'shareTwitter',
    wa: 'shareWhatsApp',
    li: 'shareLinkedIn',
    tg: 'shareTelegram',
    dc: 'shareDiscord',
    cp: 'copyLink'
  };

  if(document.getElementById(ids.fb)) document.getElementById(ids.fb).href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  if(document.getElementById(ids.tw)) document.getElementById(ids.tw).href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
  if(document.getElementById(ids.wa)) document.getElementById(ids.wa).href = `https://api.whatsapp.com/send?text=${title}%20${url}`;
  if(document.getElementById(ids.li)) document.getElementById(ids.li).href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  if(document.getElementById(ids.tg)) document.getElementById(ids.tg).href = `https://t.me/share/url?url=${url}&text=${title}`;
  if(document.getElementById(ids.dc)) document.getElementById(ids.dc).href = `https://discord.com/channels/@me?text=${title}%20${url}`;

  const copyBtn = document.getElementById(ids.cp);
  if (copyBtn) {
    copyBtn.addEventListener('click', function(){
      navigator.clipboard.writeText(window.location.href).then(() => {
        showCopyModal('¡Enlace copiado al portapapeles!');
      }).catch(() => {
        showCopyModal('No se pudo copiar el enlace.');
      });
    });
  }

  function showCopyModal(msg){
    const modalText = document.getElementById('copyModalText');
    if(modalText) modalText.textContent = msg;
    const modal = new bootstrap.Modal(document.getElementById('copyModal'));
    modal.show();
    setTimeout(()=>modal.hide(),2500);
  }
})();
