const PROJECT_ID="listazakupow-3c325";
const ENDPOINT="https://firestore.googleapis.com/v1/projects/"+PROJECT_ID+"/databases/(default)/documents/portfolio_ratings";
const form=document.querySelector("#rating-form");
const stars=[...document.querySelectorAll(".rating-star")];
const selected=document.querySelector("#rating-selected");
const comment=document.querySelector("#rating-comment");
const message=document.querySelector("#rating-message");
const average=document.querySelector("#rating-average");
const averageStars=document.querySelector("#rating-average-stars");
const count=document.querySelector("#rating-count");
let chosen=0;

function paint(value){stars.forEach(star=>star.classList.toggle("active",Number(star.dataset.rating)<=value))}
function msg(text,type=""){if(!message)return;message.textContent=text;message.className="rating-message "+type}
function readRows(data){return (data.documents||[]).map(doc=>{const f=doc.fields||{};return{rating:Number(f.rating?.integerValue||f.rating?.doubleValue||0),comment:f.comment?.stringValue||"",createdAt:f.createdAt?.timestampValue||""}})}
async function loadSummary(){
  try{
    const response=await fetch(ENDPOINT+"?pageSize=100");
    if(!response.ok)throw new Error("Firestore read "+response.status);
    const rows=readRows(await response.json());
    count.textContent=rows.length;
    if(!rows.length){average.textContent="—";averageStars.textContent="☆☆☆☆☆";return}
    const avg=rows.reduce((sum,row)=>sum+row.rating,0)/rows.length;
    average.textContent=avg.toFixed(1).replace(".",",");
    const rounded=Math.round(avg);
    averageStars.textContent="★★★★★".slice(0,rounded)+"☆☆☆☆☆".slice(0,5-rounded);
  }catch(error){console.warn("Nie udało się pobrać ocen:",error)}
}
stars.forEach(star=>{
  star.addEventListener("mouseenter",()=>paint(Number(star.dataset.rating)));
  star.addEventListener("mouseleave",()=>paint(chosen));
  star.addEventListener("click",()=>{chosen=Number(star.dataset.rating);paint(chosen);selected.textContent=chosen+"/5"});
});
form?.addEventListener("submit",async event=>{
  event.preventDefault();
  if(!chosen){msg("Najpierw wybierz ocenę.","error");return}
  if(localStorage.getItem("mythoria-rated")==="1"){msg("Z tego urządzenia ocena została już wysłana.");return}
  const submit=form.querySelector(".rating-submit");
  submit.disabled=true;msg("Zapisywanie…");
  try{
    const body={fields:{
      rating:{integerValue:String(chosen)},
      comment:{stringValue:comment.value.trim().slice(0,300)},
      createdAt:{timestampValue:new Date().toISOString()},
      language:{stringValue:document.documentElement.lang||"pl"}
    }};
    const response=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(!response.ok)throw new Error("Firestore write "+response.status);
    localStorage.setItem("mythoria-rated","1");
    msg("Dziękuję za ocenę! ⭐","success");
    form.reset();chosen=0;paint(0);selected.textContent="Wybierz ocenę 1–5";await loadSummary();
  }catch(error){console.error(error);msg("Nie udało się zapisać oceny. Sprawdź reguły Firestore.","error")}
  finally{submit.disabled=false}
});
if(localStorage.getItem("mythoria-rated")==="1")msg("Ocena z tego urządzenia została już wysłana.");
loadSummary();