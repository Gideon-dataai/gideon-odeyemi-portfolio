// Lightweight four-page PDF preview, using the same PDF already hosted on GitHub Pages.
// The full PDF link remains available if PDF.js/CDN access is unavailable.
const host=document.getElementById("pdfPreview");
const canvas=document.getElementById("dashboardCanvas");
const status=document.getElementById("pdfStatus");
const fallback=document.getElementById("pdfFallback");
const tabs=[...document.querySelectorAll("[data-pdf-page]")];
if (host && canvas && status && fallback && tabs.length) {
  let doc=null, active=1, currentRequest=0;
  const labelFor=n=>tabs.find(tab=>Number(tab.dataset.pdfPage)===n)?.textContent?.trim()||"Dashboard";
  function select(n) {
    active=n;
    tabs.forEach(tab=>{
      const selected=Number(tab.dataset.pdfPage)===n;
      tab.classList.toggle("is-active",selected);
      tab.setAttribute("aria-pressed",String(selected));
    });
    canvas.setAttribute("aria-label","Emergency Department Power BI dashboard: "+labelFor(n));
    if(doc) render(n);
  }
  async function render(n) {
    const request=++currentRequest;
    status.hidden=false;status.textContent="Rendering "+labelFor(n)+"…";
    try {
      const page=await doc.getPage(n);
      if(request!==currentRequest)return;
      // Crop only the surrounding blank PDF page margin, never the dashboard.
      const bounds={left:16,top:85,right:774,bottom:515};
      const usable=bounds.right-bounds.left;
      const scale=Math.min(2.25,Math.max(0.8,(host.clientWidth-16)/usable)*(window.devicePixelRatio||1));
      const viewport=page.getViewport({scale});
      const scratch=document.createElement("canvas");
      scratch.width=Math.round(viewport.width);
      scratch.height=Math.round(viewport.height);
      const ctx=scratch.getContext("2d",{alpha:false});
      if(!ctx)throw new Error("Canvas unavailable");
      await page.render({canvasContext:ctx,viewport}).promise;
      if(request!==currentRequest)return;
      const x=Math.round(bounds.left*scale),y=Math.round(bounds.top*scale);
      const w=Math.round(usable*scale),h=Math.round((bounds.bottom-bounds.top)*scale);
      canvas.width=w;canvas.height=h;
      const visible=canvas.getContext("2d",{alpha:false});
      if(!visible)throw new Error("Canvas unavailable");
      visible.drawImage(scratch,x,y,w,h,0,0,w,h);
      canvas.hidden=false;status.hidden=true;fallback.hidden=true;
    }catch(err) {
      if(request!==currentRequest)return;
      canvas.hidden=true;status.hidden=true;fallback.hidden=false;
      console.warn("Dashboard preview unavailable:",err);
    }
  }
  tabs.forEach(tab=>tab.addEventListener("click",()=>select(Number(tab.dataset.pdfPage))));
  (async()=>{
    try{
      // Pin both scripts to the SAME PDF.js version to avoid worker mismatches.
      const pdfjs=await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
      doc=await pdfjs.getDocument({url:host.dataset.source}).promise;
      await render(active);
    }catch(err){
      status.hidden=true;fallback.hidden=false;canvas.hidden=true;
      console.warn("PDF preview library unavailable:",err);
    }
  })();
}
