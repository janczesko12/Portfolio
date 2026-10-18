(() => {
  const GAMES = {
    "2048": ["2048", "Łącz takie same kafelki i dobij do 2048."],
    memory: ["MEMORY", "Znajdź wszystkie pary obrazków."],
    mines: ["SAPER", "Odkryj bezpieczne pola i omijaj miny."],
    pong: ["PONG", "Odbijaj piłkę; steruj palcem, myszą lub strzałkami."],
    flappy: ["FLAPPY", "Dotknij planszy lub naciśnij spację, aby lecieć."],
    tictactoe: ["KÓŁKO I KRZYŻYK", "Gra dla dwóch osób przy jednym urządzeniu."],
    reaction: ["TEST REFLEKSU", "Kliknij dopiero wtedy, gdy pole zrobi się zielone."],
    simon: ["SIMON SAYS", "Zapamiętuj sekwencję kolorów i powtarzaj ją."],
    whack: ["WHACK-A-MOLE", "Klikaj pojawiający się cel, zanim zniknie."],
    mario: ["MARIO RUN", "Skacz po platformach, zbieraj monety i unikaj przeciwników."],
    fishing: ["FISHING SIMULATOR", "Zarzuć wędkę, wyczuj branie i zbieraj ryby na ulepszenia."],
    racer: ["NEON RACER", "Omijaj ruch uliczny na neonowej autostradzie i pobij rekord."],
    invaders: ["SPACE INVADERS", "Broń Ziemi przed falami kosmitów. Strzelaj i unikaj pocisków."]
  };
  const make = (tag, cls, text) => { const e=document.createElement(tag); if(cls)e.className=cls; if(text!==undefined)e.textContent=text; return e; };
  const button = (text, cls="arcade-btn") => { const e=make("button",cls,text); e.type="button"; return e; };

  window.createArcadeGame = function(root, key) {
    if(!root || !GAMES[key]) return {destroy(){}};
    root.replaceChildren();
    root.classList.add("arcade-root");
    const cleanup=[], timers=new Set(), intervals=new Set();
    let raf=0, audio=null, destroyed=false;
    const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(!destroyed)fn();},ms);timers.add(id);return id;};
    const every=(fn,ms)=>{const id=setInterval(()=>{if(!destroyed)fn();},ms);intervals.add(id);return id;};
    const on=(el,event,fn,options)=>{el.addEventListener(event,fn,options);cleanup.push(()=>el.removeEventListener(event,fn,options));};
    const layout=make("section","arcade-shell");
    const heading=make("div","arcade-game-heading");
    heading.append(make("div","arcade-game-name",GAMES[key][0]),make("p","arcade-game-description",GAMES[key][1]));
    const stage=make("div","arcade-play-area");
    const tools=make("div","arcade-game-tools");
    const status=make("span","arcade-status","Gotowy do gry");
    const reset=button("OD NOWA","snake-btn snake-small");
    tools.append(status,reset);
    const footer=make("div","arcade-game-footer");
    layout.append(heading,stage,tools,footer);root.append(layout);
    const say=t=>status.textContent=t;
    const help=t=>footer.textContent=t;
    const put=n=>stage.append(n);

    function game2048(){
      let board=[],score=0,ended=false,won=false;
      const grid=make("div","game-2048-grid");grid.tabIndex=0;
      const line=make("div","arcade-score-line"),scoreText=make("span","","Wynik: 0"),bestText=make("span","","Rekord: 0");
      line.append(scoreText,bestText);put(line);put(grid);help("Strzałki / WASD lub przesuń palcem.");
      function spawn(){const empty=[];board.forEach((v,i)=>{if(!v)empty.push(i);});if(!empty.length)return;board[empty[Math.floor(Math.random()*empty.length)]]=Math.random()<.9?2:4;}
      function render(){grid.replaceChildren();board.forEach(v=>grid.append(make("div","tile-2048"+(v?" v"+Math.min(v,2048):""),v?String(v):"")));scoreText.textContent="Wynik: "+score;bestText.textContent="Rekord: "+Number(localStorage.getItem("novydev-2048-best")||0);}
      function fresh(){board=Array(16).fill(0);score=0;ended=false;won=false;spawn();spawn();render();say("Połącz kafelki");}
      function canMove(){for(let r=0;r<4;r++)for(let c=0;c<4;c++){let i=r*4+c;if(c<3&&board[i]===board[i+1]||r<3&&board[i]===board[i+4])return true;}return false;}
      function move(dir){
        if(ended)return;const before=board.join(",");
        for(let lineNo=0;lineNo<4;lineNo++){
          let idx=[];
          for(let p=0;p<4;p++){let r,c;if(dir==="left"){r=lineNo;c=p;}else if(dir==="right"){r=lineNo;c=3-p;}else if(dir==="up"){r=p;c=lineNo;}else{r=3-p;c=lineNo;}idx.push(r*4+c);}
          let vals=idx.map(i=>board[i]).filter(Boolean);
          for(let i=0;i<vals.length-1;i++)if(vals[i]===vals[i+1]){vals[i]*=2;score+=vals[i];vals.splice(i+1,1);if(vals[i]===2048&&!won){won=true;say("2048! Możesz grać dalej.");}}
          while(vals.length<4)vals.push(0);idx.forEach((n,i)=>board[n]=vals[i]);
        }
        if(before===board.join(","))return;spawn();render();
        let best=Number(localStorage.getItem("novydev-2048-best")||0);if(score>best)localStorage.setItem("novydev-2048-best",String(score));
        if(!board.includes(0)&&!canMove()){ended=true;say("Koniec gry — naciśnij OD NOWA.");}
      }
      const km={ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down"};
      const keyFn=e=>{if(km[e.code]&&!root.hidden){e.preventDefault();move(km[e.code]);}};
      let touch=null;on(window,"keydown",keyFn,true);on(grid,"pointerdown",e=>touch={x:e.clientX,y:e.clientY});on(grid,"pointerup",e=>{if(!touch)return;let dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))>20)move(Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up");});
      on(reset,"click",fresh);fresh();
    }

    function memoryGame(){
      const symbols=["🚀","🎮","🦊","🍕","⚡","🐸","👾","🌈"];
      let cards=[],first=null,locked=false,pairs=0,moves=0;
      const grid=make("div","memory-grid"),line=make("div","arcade-score-line"),movesEl=make("span","","Ruchy: 0"),pairsEl=make("span","","Pary: 0/8");
      line.append(movesEl,pairsEl);put(line);put(grid);help("Odkrywaj po dwie karty i znajdź wszystkie pary.");
      function deal(){cards=[...symbols,...symbols].sort(()=>Math.random()-.5).map((s,i)=>({id:i,s,open:false,match:false}));first=null;locked=false;pairs=0;moves=0;render();say("Znajdź 8 par");}
      function render(){grid.replaceChildren();cards.forEach(c=>{const b=button(c.open||c.match?c.s:"?","memory-card"+(c.match?" matched":"")+(c.open?" open":""));b.disabled=c.match;b.dataset.cardId=String(c.id);b.setAttribute("aria-label",c.open||c.match?c.s:"Zakryta karta");grid.append(b);});movesEl.textContent="Ruchy: "+moves;pairsEl.textContent="Pary: "+pairs+"/8";}
      function flip(c){if(locked||c.open||c.match)return;c.open=true;if(!first){first=c;render();return;}moves++;if(first.s===c.s){first.match=c.match=true;first=null;pairs++;render();if(pairs===8)say("Wygrana! Liczba ruchów: "+moves);}else{const old=first;first=null;locked=true;render();later(()=>{old.open=false;c.open=false;locked=false;render();},650);}}
      on(grid,"click",e=>{const b=e.target.closest("[data-card-id]");if(b)flip(cards[Number(b.dataset.cardId)]);});
      on(reset,"click",deal);deal();
    }

    function minesGame(){
      const n=9,total=81,mineCount=10;let cells=[],flagMode=false,ended=false,revealed=0;
      const grid=make("div","mines-grid"),line=make("div","arcade-score-line"),flag=button("🚩 TRYB FLAGI","arcade-btn"),counter=make("span","","Flagi: 0/10");line.append(flag,counter);put(line);put(grid);help("Kliknij pole, aby odkryć. Włącz tryb flagi, aby oznaczać miny.");
      function fresh(){cells=Array.from({length:total},()=>({mine:false,open:false,flag:false,near:0}));let count=0;while(count<mineCount){let i=Math.floor(Math.random()*total);if(!cells[i].mine){cells[i].mine=true;count++;}}cells.forEach((c,i)=>{if(c.mine)return;let r=Math.floor(i/n),col=i%n;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){let rr=r+dr,cc=col+dc;if(rr>=0&&rr<n&&cc>=0&&cc<n&&cells[rr*n+cc].mine)c.near++;}});flagMode=false;ended=false;revealed=0;flag.classList.remove("active");flag.textContent="🚩 TRYB FLAGI";render();say("Powodzenia!");}
      function render(){grid.replaceChildren();cells.forEach((c,i)=>{const b=button(c.flag?"🚩":c.open?(c.mine?"💣":c.near?String(c.near):""):"","mine-cell"+(c.open?" revealed":"")+(c.mine&&ended?" exploded":""));b.dataset.cellIndex=String(i);if(c.open&&!c.mine&&c.near)b.dataset.n=String(c.near);b.disabled=c.open||ended;grid.append(b);});counter.textContent="Flagi: "+cells.filter(c=>c.flag).length+"/"+mineCount;}
      function toggleFlag(i){if(ended||cells[i].open)return;cells[i].flag=!cells[i].flag;render();}
      function reveal(i){const c=cells[i];if(c.open||c.flag||ended)return;c.open=true;revealed++;if(c.mine){ended=true;cells.forEach(x=>{if(x.mine)x.open=true;});say("BUM! Naciśnij OD NOWA.");return;}if(!c.near){const r=Math.floor(i/n),col=i%n;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){let rr=r+dr,cc=col+dc;if(rr>=0&&rr<n&&cc>=0&&cc<n)reveal(rr*n+cc);}}}
      function act(i){if(flagMode){toggleFlag(i);return;}reveal(i);if(!ended&&revealed===total-mineCount){ended=true;say("Wygrana! Wszystkie bezpieczne pola odkryte.");}render();}
      on(grid,"click",e=>{const b=e.target.closest("[data-cell-index]");if(b)act(Number(b.dataset.cellIndex));});
      on(grid,"contextmenu",e=>{const b=e.target.closest("[data-cell-index]");if(b){e.preventDefault();toggleFlag(Number(b.dataset.cellIndex));}});
      on(flag,"click",()=>{flagMode=!flagMode;flag.classList.toggle("active",flagMode);flag.textContent=flagMode?"✓ TRYB FLAGI":"🚩 TRYB FLAGI";});on(reset,"click",fresh);fresh();
    }

    function ticTacToe(){
      let board=[],turn="X",ended=false,scores=[0,0];
      const grid=make("div","ttt-grid"),line=make("div","arcade-score-line"),score=make("span","","X: 0 • O: 0"),next=button("NOWA RUNDA","arcade-btn");line.append(score,next);put(line);put(grid);help("Dla dwóch graczy — zmieniajcie się na jednym ekranie.");
      const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      function winner(){return wins.find(a=>board[a[0]]&&board[a[0]]===board[a[1]]&&board[a[1]]===board[a[2]]);}
      function fresh(){board=Array(9).fill("");turn="X";ended=false;render();say("Ruch: X");}
      function render(){grid.replaceChildren();board.forEach((v,i)=>{const b=button(v,"ttt-cell"+(v?" "+v.toLowerCase():""));b.dataset.tttIndex=String(i);b.disabled=ended||!!v;grid.append(b);});score.textContent="X: "+scores[0]+" • O: "+scores[1];}
      function play(i){if(ended||board[i])return;board[i]=turn;const w=winner();if(w){ended=true;scores[turn==="X"?0:1]++;render();say("Wygrywa "+turn+"!");}else if(board.every(Boolean)){ended=true;render();say("Remis!");}else{turn=turn==="X"?"O":"X";render();say("Ruch: "+turn);}}
      on(grid,"click",e=>{const b=e.target.closest("[data-ttt-index]");if(b)play(Number(b.dataset.tttIndex));});
      on(next,"click",fresh);on(reset,"click",()=>{scores=[0,0];fresh();});fresh();
    }

    function reactionGame(){
      let phase="idle",startAt=0,best=Number(localStorage.getItem("novydev-reaction-best")||0);
      const zone=button("NACIŚNIJ START","reaction-zone"),record=make("div","arcade-score-line","Rekord: "+(best?best+" ms":"—"));put(zone);put(record);help("Nie klikaj za wcześnie. Poczekaj, aż pole zmieni kolor na zielony.");
      function begin(){phase="waiting";zone.className="reaction-zone waiting";zone.textContent="CZEKAJ NA ZIELONE…";say("Przygotuj się");later(()=>{if(phase!=="waiting")return;phase="go";startAt=performance.now();zone.className="reaction-zone go";zone.textContent="KLIKNIJ TERAZ!";say("Teraz!");},900+Math.random()*2500);}
      on(zone,"click",()=>{if(phase==="idle"||phase==="done"||phase==="early"){begin();return;}if(phase==="waiting"){phase="early";zone.className="reaction-zone early";zone.textContent="ZA WCZEŚNIE! — SPRÓBUJ PONOWNIE";say("Za szybko!");return;}if(phase==="go"){let ms=Math.round(performance.now()-startAt);phase="done";zone.className="reaction-zone";zone.textContent=ms+" ms — JESZCZE RAZ?";if(!best||ms<best){best=ms;localStorage.setItem("novydev-reaction-best",String(best));}record.textContent="Rekord: "+best+" ms";say(ms<230?"Niesamowity refleks!":ms<350?"Dobry wynik!":"Trenuj dalej!");}});
      on(reset,"click",()=>{phase="idle";zone.className="reaction-zone";zone.textContent="NACIŚNIJ START";best=0;record.textContent="Rekord: —";say("Gotowy");});
    }

    function simonGame(){
      const grid=make("div","simon-grid"),colors=["lime","blue","pink","amber"],pads=colors.map((c,i)=>{const b=button(String(i+1),"simon-pad "+c);grid.append(b);return b;});
      const roundText=make("div","arcade-score-line","Poziom: 0");put(roundText);put(grid);help("Obserwuj i słuchaj sekwencji, potem powtórz ją w tej samej kolejności.");
      let seq=[],input=0,playing=false,round=0;
      function flash(i){pads[i].classList.add("lit");later(()=>pads[i].classList.remove("lit"),270);try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();const osc=audio.createOscillator(),gain=audio.createGain();osc.frequency.value=[330,392,494,587][i];gain.gain.value=.045;osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.12);}catch{}}
      function playSeq(){playing=true;input=0;say("Zapamiętuj…");seq.forEach((v,i)=>later(()=>flash(v),450+i*510));later(()=>{playing=false;say("Teraz Twoja kolej!");},450+seq.length*510);}
      function fresh(){seq=[];round=0;next();}function next(){round++;roundText.textContent="Poziom: "+round;seq.push(Math.floor(Math.random()*4));playSeq();}
      pads.forEach((b,i)=>on(b,"click",()=>{if(playing||!round)return;flash(i);if(seq[input]!==i){say("Koniec! Udało się dojść do poziomu "+round+".");round=0;return;}input++;if(input===seq.length){playing=true;say("Dobrze!");later(()=>{playing=false;next();},700);}}));
      on(reset,"click",fresh);fresh();
    }

    function whackGame(){
      let score=0,remaining=30,active=-1,running=false,tick=null;
      const line=make("div","arcade-score-line"),sc=make("span","","Punkty: 0"),tm=make("span","","Czas: 30 s"),grid=make("div","whack-grid"),start=button("START 30 S","arcade-btn");
      line.append(sc,tm);put(line);put(grid);put(start);help("Kliknij kreta, gdy się pojawi. Trafienie daje punkt.");
      function render(){grid.replaceChildren();for(let i=0;i<9;i++){const b=button(active===i?"🐹":"", "whack-hole"+(active===i?" mole":""));b.dataset.holeIndex=String(i);grid.append(b);}tm.textContent="Czas: "+remaining+" s";}
      on(grid,"click",e=>{const b=e.target.closest("[data-hole-index]");if(!b||!running||active!==Number(b.dataset.holeIndex))return;score++;sc.textContent="Punkty: "+score;active=-1;render();});
      function end(){running=false;active=-1;render();start.disabled=false;start.textContent="ZAGRAJ JESZCZE RAZ";say("Koniec! Wynik: "+score);}
      function begin(){score=0;remaining=30;active=Math.floor(Math.random()*9);running=true;start.disabled=true;start.textContent="GRA W TOKU";sc.textContent="Punkty: 0";render();if(tick)clearInterval(tick);tick=every(()=>{if(!running)return;remaining--;active=Math.floor(Math.random()*9);render();if(remaining<=0)end();},1000);}
      on(start,"click",begin);on(reset,"click",begin);render();say("Naciśnij START");
    }

    function pongGame(){
      const canvas=make("canvas","arcade-canvas");canvas.width=720;canvas.height=420;canvas.tabIndex=0;put(canvas);
      const ctx=canvas.getContext("2d");let p1=210,p2=210,ball={x:360,y:210,vx:330,vy:170},scores=[0,0],last=0,live=true,keys=new Set();
      help("Przesuń palcem lub myszą po planszy albo użyj ↑ ↓. Gra do 7 punktów.");
      function serve(dir){ball={x:360,y:210,vx:dir*(300+Math.random()*60),vy:(Math.random()-.5)*230};}
      function draw(){ctx.fillStyle="#07100d";ctx.fillRect(0,0,720,420);ctx.strokeStyle="rgba(183,255,74,.2)";ctx.setLineDash([7,10]);ctx.beginPath();ctx.moveTo(360,0);ctx.lineTo(360,420);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle="#b7ff4a";ctx.fillRect(18,p1-48,12,96);ctx.fillRect(690,p2-48,12,96);ctx.beginPath();ctx.arc(ball.x,ball.y,8,0,Math.PI*2);ctx.fill();ctx.font="bold 34px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle="rgba(183,255,74,.75)";ctx.fillText(scores[0],270,45);ctx.fillText(scores[1],450,45);}
      function tick(t){if(destroyed||!live)return;const dt=Math.min(.03,(t-(last||t))/1000);last=t;if(keys.has("ArrowUp")||keys.has("KeyW"))p1-=420*dt;if(keys.has("ArrowDown")||keys.has("KeyS"))p1+=420*dt;p1=Math.max(50,Math.min(370,p1));p2+=((ball.y-p2)*Math.min(1,dt*4.3));p2=Math.max(50,Math.min(370,p2));ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.y<8||ball.y>412)ball.vy*=-1;if(ball.vx<0&&ball.x<38&&ball.y>p1-50&&ball.y<p1+50){ball.vx=Math.abs(ball.vx)*1.04;ball.vy+=((ball.y-p1)/50)*120;}if(ball.vx>0&&ball.x>682&&ball.y>p2-50&&ball.y<p2+50){ball.vx=-Math.abs(ball.vx)*1.04;ball.vy+=((ball.y-p2)/50)*100;}if(ball.x<0||ball.x>720){scores[ball.x<0?1:0]++;if(Math.max(...scores)>=7){live=false;say(scores[0]>=7?"Wygrywasz!":"Komputer wygrywa.");draw();return;}serve(ball.x<0?1:-1);}draw();raf=requestAnimationFrame(tick);}
      const kd=e=>{if(["ArrowUp","ArrowDown"].includes(e.code))e.preventDefault();if(["ArrowUp","ArrowDown","KeyW","KeyS"].includes(e.code))keys.add(e.code);};const ku=e=>keys.delete(e.code);
      const pos=e=>{const r=canvas.getBoundingClientRect();if(r.height)p1=Math.max(50,Math.min(370,(e.clientY-r.top)*420/r.height));};
      function fresh(){if(raf)cancelAnimationFrame(raf);raf=0;scores=[0,0];p1=p2=210;live=true;last=0;keys.clear();serve(Math.random()<.5?1:-1);say("Gra trwa");draw();raf=requestAnimationFrame(tick);}
      on(window,"keydown",kd,true);on(window,"keyup",ku,true);on(canvas,"pointermove",pos);on(canvas,"pointerdown",pos);on(reset,"click",fresh);fresh();cleanup.push(()=>{live=false;});
    }

    function flappyGame(){
      const canvas=make("canvas","arcade-canvas flappy-canvas");canvas.width=420;canvas.height=600;canvas.tabIndex=0;put(canvas);const ctx=canvas.getContext("2d");
      let bird=290,vy=0,pipes=[],score=0,started=false,dead=false,last=0,spawn=0;
      help("Dotknij planszy lub naciśnij spację, aby podskoczyć.");
      function draw(){const grad=ctx.createLinearGradient(0,0,0,600);grad.addColorStop(0,"#102d40");grad.addColorStop(1,"#10172b");ctx.fillStyle=grad;ctx.fillRect(0,0,420,600);ctx.fillStyle="rgba(255,255,255,.07)";for(let i=0;i<7;i++){const x=((i*89-score*2)%520+520)%520-40;ctx.beginPath();ctx.ellipse(x,90+i%3*35,30,9,0,0,Math.PI*2);ctx.fill();}pipes.forEach(p=>{ctx.fillStyle="#75cf53";ctx.fillRect(p.x,0,58,p.top);ctx.fillRect(p.x,p.top+150,58,600-p.top-150);ctx.fillStyle="#b7ff4a";ctx.fillRect(p.x-4,p.top-15,66,15);ctx.fillRect(p.x-4,p.top+150,66,15);});ctx.fillStyle="#ffd166";ctx.beginPath();ctx.arc(100,bird,14,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(105,bird-4,4,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ff9f43";ctx.beginPath();ctx.moveTo(112,bird+1);ctx.lineTo(128,bird+6);ctx.lineTo(112,bird+10);ctx.fill();ctx.font="bold 30px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle="#fff";ctx.fillText(score,210,50);if(!started||dead){ctx.fillStyle="rgba(0,0,0,.6)";ctx.fillRect(30,245,360,100);ctx.fillStyle="#b7ff4a";ctx.font="bold 18px ui-monospace,monospace";ctx.fillText(dead?"KONIEC GRY":"GOTOWY?",210,282);ctx.font="12px ui-monospace,monospace";ctx.fillStyle="#fff";ctx.fillText(dead?"Dotknij, aby spróbować ponownie":"Dotknij / spacja = lot",210,311);}}
      function fresh(){bird=290;vy=0;pipes=[];score=0;started=false;dead=false;last=0;spawn=0;say("Dotknij, aby wystartować");draw();}
      function flap(){if(dead){fresh();started=true;}if(!started){started=true;say("Leć!");}vy=-390;}
      function tick(t){if(destroyed)return;const dt=Math.min(.03,(t-(last||t))/1000);last=t;if(started&&!dead){vy+=1080*dt;bird+=vy*dt;spawn+=dt;if(spawn>1.45){spawn=0;pipes.push({x:440,top:70+Math.random()*270,passed:false});}pipes.forEach(p=>{p.x-=165*dt;if(!p.passed&&p.x+58<100){p.passed=true;score++;say("Punkty: "+score);}if(100+14>p.x&&100-14<p.x+58&&(bird-14<p.top||bird+14>p.top+150))dead=true;});pipes=pipes.filter(p=>p.x>-70);if(bird>586||bird<0)dead=true;if(dead)say("Koniec. Wynik: "+score);}draw();raf=requestAnimationFrame(tick);}
      const kd=e=>{if(e.code==="Space"||e.code==="ArrowUp"){if(!root.hidden){e.preventDefault();flap();}}};on(window,"keydown",kd,true);on(canvas,"pointerdown",e=>{e.preventDefault();flap();});on(reset,"click",fresh);fresh();raf=requestAnimationFrame(tick);
    }



    function marioGame(){
      const canvas=make("canvas","arcade-canvas mario-canvas");canvas.width=800;canvas.height=420;canvas.tabIndex=0;put(canvas);
      const ctx=canvas.getContext("2d");let player={x:90,y:290,w:25,h:34,vx:0,vy:0,onGround:false};let camera=0,coins=[],enemies=[],score=0,lives=3,ended=false,last=0,keys=new Set(),rafId=0;
      const world=4200,gravity=1500;
      const platforms=[{x:0,y:350,w:650,h:70},{x:730,y:320,w:250,h:100},{x:1060,y:280,w:230,h:140},{x:1370,y:340,w:420,h:80},{x:1880,y:300,w:300,h:120},{x:2260,y:350,w:400,h:70},{x:2740,y:290,w:260,h:130},{x:3090,y:330,w:430,h:90},{x:3620,y:280,w:360,h:140},{x:4010,y:350,w:190,h:70},{x:250,y:260,w:120,h:18},{x:520,y:210,w:110,h:18},{x:820,y:220,w:110,h:18},{x:1130,y:180,w:110,h:18},{x:1510,y:250,w:120,h:18},{x:1980,y:210,w:120,h:18},{x:2380,y:250,w:130,h:18},{x:2820,y:190,w:120,h:18},{x:3240,y:230,w:120,h:18},{x:3710,y:180,w:120,h:18}];
      function seed(){coins=[];for(let x=180;x<world-100;x+=105){let platform=platforms.filter(p=>x>=p.x&&x<p.x+p.w).sort((a,b)=>a.y-b.y)[0];coins.push({x,y:platform?platform.y-36:260,taken:false});}enemies=[];for(let x=500;x<world-200;x+=430)enemies.push({x,y:0,w:25,h:24,dir:Math.random()<.5?-1:1,alive:true});}
      function fresh(){player={x:70,y:290,w:25,h:34,vx:0,vy:0,onGround:false};camera=0;score=0;lives=3;ended=false;last=0;keys.clear();seed();say("Zbieraj monety • dojdz do mety");draw();if(rafId)cancelAnimationFrame(rafId);rafId=requestAnimationFrame(tick);}
      function jump(){if(ended){fresh();return;}if(player.onGround){player.vy=-570;player.onGround=false;}}
      function draw(){const grad=ctx.createLinearGradient(0,0,0,420);grad.addColorStop(0,"#101b43");grad.addColorStop(1,"#312653");ctx.fillStyle=grad;ctx.fillRect(0,0,800,420);for(let i=0;i<55;i++){ctx.fillStyle="rgba(255,255,255,.45)";ctx.fillRect((i*137-camera*.18)%850,25+(i*71)%170,2,2);}ctx.save();ctx.translate(-camera,0);
        platforms.forEach(p=>{ctx.fillStyle="#243f39";ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle="#9bea58";ctx.fillRect(p.x,p.y,p.w,7);for(let x=p.x+12;x<p.x+p.w;x+=28){ctx.fillStyle="rgba(255,255,255,.05)";ctx.fillRect(x,p.y+16,12,3);}});
        coins.forEach(c=>{if(c.taken)return;ctx.fillStyle="#ffd166";ctx.beginPath();ctx.ellipse(c.x,c.y,8,11,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff0a8";ctx.fillRect(c.x-2,c.y-6,3,12);});
        enemies.forEach(e=>{if(!e.alive)return;ctx.fillStyle="#f36f78";ctx.fillRect(e.x,e.y,e.w,e.h);ctx.fillStyle="#1b1727";ctx.fillRect(e.x+5,e.y+6,4,5);ctx.fillRect(e.x+16,e.y+6,4,5);ctx.fillStyle="#fff";ctx.fillRect(e.x+4,e.y+e.h-3,7,3);ctx.fillRect(e.x+15,e.y+e.h-3,7,3);});
        // Original pixel hero, not an imported game sprite.
        ctx.fillStyle="#ff595e";ctx.fillRect(player.x+2,player.y,21,8);ctx.fillRect(player.x,player.y+6,25,5);ctx.fillStyle="#f2b38b";ctx.fillRect(player.x+5,player.y+10,16,10);ctx.fillStyle="#201a27";ctx.fillRect(player.x+17,player.y+14,3,3);ctx.fillStyle="#3978ff";ctx.fillRect(player.x+4,player.y+20,18,10);ctx.fillStyle="#f2b38b";ctx.fillRect(player.x,player.y+20,5,8);ctx.fillRect(player.x+21,player.y+20,5,8);ctx.fillStyle="#5b3b2b";ctx.fillRect(player.x+4,player.y+29,7,5);ctx.fillRect(player.x+16,player.y+29,7,5);
        ctx.fillStyle="#b7ff4a";ctx.fillRect(4160,310,8,40);ctx.fillRect(4140,310,28,5);ctx.restore();ctx.fillStyle="#fff";ctx.font="bold 15px ui-monospace,monospace";ctx.fillText("MONETY "+score+"   ŻYCIA "+lives,18,26);if(ended){ctx.fillStyle="rgba(5,8,15,.78)";ctx.fillRect(140,145,520,120);ctx.textAlign="center";ctx.fillStyle="#b7ff4a";ctx.font="bold 25px ui-monospace,monospace";ctx.fillText(player.x>4100?"POZIOM UKOŃCZONY!":"KONIEC GRY",400,190);ctx.fillStyle="#fff";ctx.font="13px ui-monospace,monospace";ctx.fillText("Monety: "+score+" • naciśnij OD NOWA",400,220);ctx.textAlign="left";}}
      function tick(t){if(destroyed)return;const dt=Math.min(.03,(t-(last||t))/1000);last=t;if(!ended){const oldY=player.y;player.vx=(keys.has("ArrowRight")||keys.has("KeyD")?260:0)-(keys.has("ArrowLeft")||keys.has("KeyA")?260:0);player.x=Math.max(0,Math.min(world-player.w,player.x+player.vx*dt));player.vy=Math.min(900,player.vy+gravity*dt);player.y+=player.vy*dt;player.onGround=false;for(const p of platforms){if(player.x+player.w>p.x&&player.x<p.x+p.w&&oldY+player.h<=p.y+5&&player.y+player.h>=p.y&&player.vy>=0){player.y=p.y-player.h;player.vy=0;player.onGround=true;}}if(player.y>500){lives--;if(lives<=0)ended=true;else{player.x=Math.max(70,player.x-180);player.y=180;player.vy=0;}}coins.forEach(c=>{if(!c.taken&&Math.abs(player.x+player.w/2-c.x)<20&&Math.abs(player.y+player.h/2-c.y)<25){c.taken=true;score++;}});enemies.forEach(e=>{if(!e.alive)return;e.y=(platforms.filter(p=>e.x>=p.x&&e.x<p.x+p.w).sort((a,b)=>a.y-b.y)[0]?.y||350)-e.h;e.x+=e.dir*65*dt;if(e.x<0||e.x>world-50)e.dir*=-1;if(player.x+player.w>e.x&&player.x<e.x+e.w&&player.y+player.h>e.y&&player.y<e.y+e.h){if(player.vy>80&&player.y+player.h<e.y+15){e.alive=false;player.vy=-350;score+=3;}else{lives--;player.x=Math.max(0,player.x-100);player.vy=-220;if(lives<=0)ended=true;}}});if(player.x>4120){ended=true;say("Poziom ukończony!");}camera=Math.max(0,Math.min(world-800,player.x-250));}draw();rafId=requestAnimationFrame(tick);}
      const kd=e=>{if(["ArrowLeft","ArrowRight","ArrowUp","Space","KeyA","KeyD","KeyW"].includes(e.code)){e.preventDefault();keys.add(e.code);if(["ArrowUp","Space","KeyW"].includes(e.code))jump();}},ku=e=>keys.delete(e.code);on(window,"keydown",kd,true);on(window,"keyup",ku,true);on(canvas,"pointerdown",e=>{canvas.focus();const r=canvas.getBoundingClientRect();if(e.pointerType==="touch"||e.pointerType==="pen"){const px=e.clientX-r.left,py=e.clientY-r.top;if(py<r.height*.55)jump();else player.x=Math.max(0,Math.min(world-player.w,player.x+(px<r.width/2?-125:125)));return;}if(e.clientX>r.left+r.width*.55)keys.add("ArrowRight");else keys.add("ArrowLeft");if(e.clientY<r.top+r.height*.55)jump();});on(canvas,"pointerup",()=>{keys.delete("ArrowLeft");keys.delete("ArrowRight");});on(reset,"click",fresh);help("← → / A D — ruch • ↑ / W / SPACJA — skok • telefon: dotknij lewej/prawej strony");fresh();
    }

    function fishingGame(){
      let money=0,caught=0,phase="idle",biteTimer=null,biteAt=0,fishName="",fishValue=0,rod=1;
      const scene=make("div","fishing-scene"),sky=make("div","fishing-sky"),sun=make("div","fishing-sun"),water=make("div","fishing-water"),boat=make("div","fishing-boat","〰 〰 〰"),float=make("div","fishing-float","●"),shore=make("div","fishing-shore"),line=make("div","fishing-line"),stats=make("div","fishing-stats"),moneyEl=make("strong","","🪙 0"),caughtEl=make("strong","","🐟 0 zł"),rodEl=make("strong","","🎣 Wędka 1"),cast=button("ZARZUĆ WĘDKĘ","fishing-cast"),upgrade=button("ULEPSZ WĘDKĘ · 30 zł","fishing-upgrade");
      sky.append(sun);water.append(boat,float,line);scene.append(sky,water,shore);put(scene);stats.append(moneyEl,caughtEl,rodEl);put(stats);const actions=make("div","fishing-actions");actions.append(cast,upgrade);put(actions);help("Zarzuć wędkę i kliknij ZŁÓW, gdy spławik zacznie świecić.");
      const fish=["Płoć","Okoń","Karaś","Szczupak","Złoty karp"];
      function update(){moneyEl.textContent="🪙 "+money+" zł";caughtEl.textContent="🐟 Złowione: "+caught;rodEl.textContent="🎣 Wędka "+rod;upgrade.disabled=money<30*rod||rod>=5;upgrade.textContent=rod>=5?"MAKS. WĘDKA":"ULEPSZ WĘDKĘ · "+(30*rod)+" zł";}
      function resetPhase(){if(biteTimer)clearTimeout(biteTimer);biteTimer=null;phase="idle";float.classList.remove("biting");cast.disabled=false;cast.textContent="ZARZUĆ WĘDKĘ";say("Spokojna woda…");}
      on(cast,"click",()=>{if(phase==="bite"){const delay=Date.now()-biteAt;const index=Math.min(fish.length-1,Math.floor(Math.random()*(rod+1)));fishName=fish[index];fishValue=(index+1)*8+rod*4;money+=fishValue;caught++;say("Złowiono: "+fishName+" · +"+fishValue+" zł");resetPhase();update();return;}if(phase!=="idle")return;phase="waiting";cast.disabled=true;cast.textContent="CZEKAJ NA BRANIE…";say("Cierpliwości…");biteTimer=setTimeout(()=>{phase="bite";biteAt=Date.now();float.classList.add("biting");cast.disabled=false;cast.textContent="ZŁÓW RYBĘ!";say("BRANIE! Kliknij szybko!");biteTimer=setTimeout(()=>{if(phase==="bite"){resetPhase();say("Ryba uciekła! Spróbuj ponownie.");}},2200+Math.random()*1600);},1400+Math.random()*3000);});
      on(upgrade,"click",()=>{if(rod<5&&money>=30*rod){money-=30*rod;rod++;update();say("Wędka ulepszona do poziomu "+rod+"!");}});on(reset,"click",()=>{resetPhase();money=0;caught=0;rod=1;update();});update();
    }

    function racerGame(){
      const canvas=make("canvas","arcade-canvas racer-canvas");canvas.width=420;canvas.height=620;canvas.tabIndex=0;put(canvas);const ctx=canvas.getContext("2d");
      let x=210,lane=1,traffic=[],score=0,best=Number(localStorage.getItem("novydev-racer-best")||0),speed=250,started=false,ended=false,last=0,spawn=0,keys=new Set();const laneX=[90,210,330];
      function fresh(){x=210;lane=1;traffic=[];score=0;speed=250;started=false;ended=false;last=0;spawn=0;keys.clear();say("Dotknij, aby wystartować");draw();}
      function draw(){const g=ctx.createLinearGradient(0,0,0,620);g.addColorStop(0,"#100b2b");g.addColorStop(1,"#050711");ctx.fillStyle=g;ctx.fillRect(0,0,420,620);ctx.fillStyle="#141a2d";ctx.fillRect(35,0,350,620);ctx.strokeStyle="#00eaff";ctx.lineWidth=3;ctx.strokeRect(35,0,350,620);ctx.strokeStyle="rgba(255,255,255,.35)";ctx.lineWidth=3;ctx.setLineDash([30,28]);ctx.lineDashOffset=-(score*2%58);ctx.beginPath();ctx.moveTo(151,0);ctx.lineTo(151,620);ctx.moveTo(269,0);ctx.lineTo(269,620);ctx.stroke();ctx.setLineDash([]);traffic.forEach(t=>car(t.x,t.y,t.color));car(x,520,"#ff3eaa",true);ctx.fillStyle="#fff";ctx.font="bold 15px ui-monospace,monospace";ctx.fillText("DIST "+Math.floor(score)+" m",15,25);ctx.fillText("BEST "+Math.floor(best)+" m",275,25);if(!started||ended){ctx.fillStyle="rgba(4,6,18,.82)";ctx.fillRect(45,245,330,120);ctx.textAlign="center";ctx.fillStyle="#00eaff";ctx.font="bold 22px ui-monospace,monospace";ctx.fillText(ended?"KOLIZJA!":"NEON RACER",210,286);ctx.fillStyle="#fff";ctx.font="12px ui-monospace,monospace";ctx.fillText(ended?"Wynik: "+Math.floor(score)+" m":"Dotknij / ← →, aby ruszyć",210,315);ctx.textAlign="left";}}
      function car(cx,cy,color,hero=false){ctx.save();ctx.translate(cx,cy);ctx.shadowColor=color;ctx.shadowBlur=hero?18:8;ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(-22,-39,44,78,9);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#101321";ctx.fillRect(-15,-25,30,19);ctx.fillRect(-15,10,30,15);ctx.fillStyle=hero?"#f8faff":"#ffd166";ctx.fillRect(-18,-33,9,5);ctx.fillRect(9,-33,9,5);ctx.fillStyle="#080a12";ctx.fillRect(-26,-24,5,18);ctx.fillRect(21,-24,5,18);ctx.fillRect(-26,14,5,18);ctx.fillRect(21,14,5,18);ctx.restore();}
      function tick(t){if(destroyed)return;const dt=Math.min(.03,(t-(last||t))/1000);last=t;if(started&&!ended){if(keys.has("ArrowLeft")||keys.has("KeyA"))x-=300*dt;if(keys.has("ArrowRight")||keys.has("KeyD"))x+=300*dt;x=Math.max(65,Math.min(355,x));spawn+=dt;if(spawn>Math.max(.38,.9-score/1500)){spawn=0;traffic.push({x:laneX[Math.floor(Math.random()*3)],y:-60,color:["#ff4b6e","#a56bff","#ffb84d","#52ffb8"][Math.floor(Math.random()*4)]});}speed=Math.min(520,250+score*.18);traffic.forEach(a=>a.y+=speed*dt);traffic=traffic.filter(a=>a.y<700);traffic.forEach(a=>{if(Math.abs(a.x-x)<39&&Math.abs(a.y-520)<62)ended=true;});score+=dt*speed*.18;if(ended){best=Math.max(best,score);localStorage.setItem("novydev-racer-best",String(Math.floor(best)));say("Kolizja! Wynik: "+Math.floor(score)+" m");}}draw();raf=requestAnimationFrame(tick);}
      const kd=e=>{if(["ArrowLeft","ArrowRight","KeyA","KeyD","Space"].includes(e.code)){e.preventDefault();if(!started||ended){fresh();started=true;say("Uważaj na ruch!");}if(e.code==="ArrowLeft"||e.code==="KeyA")x=Math.max(65,x-118);if(e.code==="ArrowRight"||e.code==="KeyD")x=Math.min(355,x+118);keys.add(e.code);}},ku=e=>keys.delete(e.code);on(window,"keydown",kd,true);on(window,"keyup",ku,true);on(canvas,"pointerdown",e=>{canvas.focus();if(!started||ended){fresh();started=true;}const r=canvas.getBoundingClientRect();x=e.clientX<r.left+r.width/2?Math.max(65,x-118):Math.min(355,x+118);});on(reset,"click",()=>{fresh();started=true;});fresh();raf=requestAnimationFrame(tick);
    }

    function invadersGame(){
      const canvas=make("canvas","arcade-canvas invaders-canvas");canvas.width=720;canvas.height=500;canvas.tabIndex=0;put(canvas);const ctx=canvas.getContext("2d");
      let ship=360,shots=[],aliens=[],enemyShots=[],score=0,lives=3,dir=1,step=0,ended=false,keys=new Set(),last=0,fire=0;
      function formation(){aliens=[];for(let r=0;r<4;r++)for(let c=0;c<9;c++)aliens.push({x:100+c*58,y:65+r*48,alive:true,row:r});}
      function fresh(){ship=360;shots=[];enemyShots=[];score=0;lives=3;dir=1;step=0;ended=false;last=0;fire=0;keys.clear();formation();say("← → / A D • SPACJA = strzał");draw();}
      function draw(){const g=ctx.createLinearGradient(0,0,0,500);g.addColorStop(0,"#090c24");g.addColorStop(1,"#03070d");ctx.fillStyle=g;ctx.fillRect(0,0,720,500);for(let i=0;i<90;i++){ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillRect((i*83)%720,(i*47)%500,2,2);}ctx.strokeStyle="rgba(0,234,255,.15)";ctx.beginPath();ctx.moveTo(0,465);ctx.lineTo(720,465);ctx.stroke();aliens.forEach((a,i)=>{if(!a.alive)return;ctx.fillStyle=["#b7ff4a","#4ee9ff","#ff5da2","#b18cff"][a.row];ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.fillRect(a.x,a.y,29,18);ctx.fillRect(a.x+5,a.y-5,5,5);ctx.fillRect(a.x+19,a.y-5,5,5);ctx.fillRect(a.x+5,a.y+17,5,5);ctx.fillRect(a.x+19,a.y+17,5,5);ctx.shadowBlur=0;ctx.fillStyle="#071018";ctx.fillRect(a.x+6,a.y+5,4,4);ctx.fillRect(a.x+19,a.y+5,4,4);});ctx.fillStyle="#f5f7ff";shots.forEach(s=>ctx.fillRect(s.x-2,s.y-9,4,12));ctx.fillStyle="#ff5da2";enemyShots.forEach(s=>ctx.fillRect(s.x-3,s.y,6,12));ctx.fillStyle="#00eaff";ctx.shadowColor="#00eaff";ctx.shadowBlur=16;ctx.beginPath();ctx.moveTo(ship,440);ctx.lineTo(ship-23,470);ctx.lineTo(ship+23,470);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#fff";ctx.font="bold 15px ui-monospace,monospace";ctx.fillText("WYNIK "+score+"    ŻYCIA "+lives,16,25);if(ended||!aliens.some(a=>a.alive)){ctx.fillStyle="rgba(0,0,0,.7)";ctx.fillRect(150,205,420,100);ctx.textAlign="center";ctx.fillStyle="#00eaff";ctx.font="bold 24px ui-monospace,monospace";ctx.fillText(aliens.some(a=>a.alive)?"KONIEC GRY":"SEKTOR OCZYSZCZONY",360,245);ctx.fillStyle="#fff";ctx.font="13px ui-monospace,monospace";ctx.fillText("Wynik: "+score+" • kliknij OD NOWA",360,274);ctx.textAlign="left";}}
      function tick(t){if(destroyed)return;const dt=Math.min(.04,(t-(last||t))/1000);last=t;if(!ended){if(keys.has("ArrowLeft")||keys.has("KeyA"))ship=Math.max(28,ship-300*dt);if(keys.has("ArrowRight")||keys.has("KeyD"))ship=Math.min(692,ship+300*dt);shots.forEach(s=>s.y-=440*dt);enemyShots.forEach(s=>s.y+=200*dt);shots=shots.filter(s=>s.y>-20);enemyShots=enemyShots.filter(s=>s.y<520);step+=dt;const alive=aliens.filter(a=>a.alive);if(step>.48){step=0;let edge=false;alive.forEach(a=>{a.x+=dir*13;if(a.x<8||a.x>683)edge=true;});if(edge){dir*=-1;alive.forEach(a=>a.y+=13);}}fire+=dt;if(fire>Math.max(.35,1.1-alive.length*.01)){fire=0;if(alive.length){const a=alive[Math.floor(Math.random()*alive.length)];enemyShots.push({x:a.x+14,y:a.y+20});}}shots.forEach(s=>{const a=aliens.find(a=>a.alive&&s.x>a.x-4&&s.x<a.x+33&&s.y>a.y-6&&s.y<a.y+26);if(a){a.alive=false;s.y=-50;score+=10;}});enemyShots.forEach(s=>{if(Math.abs(s.x-ship)<23&&s.y>438&&s.y<472){s.y=550;lives--;if(lives<=0)ended=true;}});if(alive.some(a=>a.y>415))ended=true;}draw();raf=requestAnimationFrame(tick);}
      const kd=e=>{if(["ArrowLeft","ArrowRight","KeyA","KeyD","Space"].includes(e.code)){e.preventDefault();keys.add(e.code);if(e.code==="Space"&&!ended)shots.push({x:ship,y:438});}},ku=e=>keys.delete(e.code);on(window,"keydown",kd,true);on(window,"keyup",ku,true);on(canvas,"pointermove",e=>{const r=canvas.getBoundingClientRect();ship=Math.max(28,Math.min(692,(e.clientX-r.left)*720/r.width));});on(canvas,"pointerdown",()=>{if(ended){fresh();return;}shots.push({x:ship,y:438});});on(reset,"click",fresh);fresh();raf=requestAnimationFrame(tick);
    }

    function init(){
      if(key==="2048")game2048();
      else if(key==="memory")memoryGame();
      else if(key==="mines")minesGame();
      else if(key==="pong")pongGame();
      else if(key==="flappy")flappyGame();
      else if(key==="tictactoe")ticTacToe();
      else if(key==="reaction")reactionGame();
      else if(key==="simon")simonGame();
      else if(key==="whack")whackGame();
      else if(key==="mario")marioGame();
      else if(key==="fishing")fishingGame();
      else if(key==="racer")racerGame();
      else if(key==="invaders")invadersGame();
    }
    init();
    return {destroy(){if(destroyed)return;destroyed=true;if(raf)cancelAnimationFrame(raf);timers.forEach(clearTimeout);intervals.forEach(clearInterval);cleanup.forEach(fn=>{try{fn();}catch{}});try{if(audio)audio.close();}catch{}root.replaceChildren();root.classList.remove("arcade-root");}};
  };
})();