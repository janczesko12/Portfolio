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
      const catalog=[
        {kind:"rod",id:"starter-rod",name:"Wędka startowa",icon:"🎣",price:0,power:0,desc:"Dobra na pierwsze połowy. Niewielki bonus do celowania."},
        {kind:"rod",id:"bamboo-rod",name:"Wędka bambusowa",icon:"🎋",price:65,power:1,desc:"Lżejsza i czulsza. Szersze okno zacięcia."},
        {kind:"rod",id:"carbon-rod",name:"Wędka węglowa",icon:"⚡",price:185,power:2,desc:"Sprężysta konstrukcja pomaga przy większych rybach."},
        {kind:"rod",id:"pro-rod",name:"Wędka PRO",icon:"🏆",price:430,power:3,desc:"Sprzęt klasy turniejowej. Największa kontrola."},
        {kind:"bait",id:"worm-bait",name:"Robaki",icon:"🪱",price:0,luck:0,wait:1,bonus:0,desc:"Klasyczna przynęta na spokojne połowy."},
        {kind:"bait",id:"corn-bait",name:"Kukurydza",icon:"🌽",price:25,luck:.12,wait:.82,bonus:2,desc:"Szybciej przyciąga ryby spokojnego żeru."},
        {kind:"bait",id:"spinner-bait",name:"Błystka",icon:"✨",price:75,luck:.28,wait:1.08,bonus:6,desc:"Lepsza szansa na drapieżniki i większy połów."},
        {kind:"bait",id:"gold-bait",name:"Złota przynęta",icon:"🌟",price:165,luck:.62,wait:1.16,bonus:14,desc:"Rzadka przynęta zwiększająca szansę na okaz."},
        {kind:"reel",id:"basic-reel",name:"Kołowrotek standard",icon:"⚙️",price:0,control:0,desc:"Podstawowy mechanizm na początek."},
        {kind:"reel",id:"smooth-reel",name:"Kołowrotek płynny",icon:"🌀",price:90,control:1,desc:"Napięcie żyłki szybciej spada po udanym ruchu."},
        {kind:"reel",id:"precision-reel",name:"Kołowrotek PRO",icon:"🔩",price:235,control:2,desc:"Większa precyzja oraz łatwiejsze holowanie."},
        {kind:"line",id:"basic-line",name:"Żyłka standard",icon:"〰️",price:0,strength:100,desc:"Wytrzymałość na napięcie: 100."},
        {kind:"line",id:"fluoro-line",name:"Żyłka fluorocarbon",icon:"💧",price:85,strength:128,desc:"Mocniejsza żyłka. Wytrzymałość: 128."},
        {kind:"line",id:"braid-line",name:"Plecionka wzmocniona",icon:"🧵",price:210,strength:160,desc:"Do walki z naprawdę dużymi rybami. Wytrzymałość: 160."}
      ];
      const species=[
        {name:"Płoć",emoji:"🐟",price:13,diff:1,weight:.34,rarity:1},
        {name:"Okoń",emoji:"🐠",price:20,diff:1.15,weight:.29,rarity:1.2},
        {name:"Leszcz",emoji:"🐟",price:25,diff:1.35,weight:.2,rarity:1.5},
        {name:"Karaś",emoji:"🐡",price:31,diff:1.45,weight:.14,rarity:1.7},
        {name:"Szczupak",emoji:"🐊",price:43,diff:1.9,weight:.09,rarity:2.4},
        {name:"Jesiotr",emoji:"🐟",price:66,diff:2.35,weight:.045,rarity:3.2},
        {name:"Złoty karp",emoji:"✨",price:100,diff:2.8,weight:.018,rarity:4}
      ];
      const scene=make("div","fishing-scene");
      const sky=make("div","fishing-sky");
      const sun=make("div","fishing-sun");
      const cloudA=make("span","fishing-cloud fishing-cloud-a","☁");
      const cloudB=make("span","fishing-cloud fishing-cloud-b","☁");
      const hills=make("div","fishing-hills");
      const farHill=make("span","fishing-hill fishing-hill-far");
      const nearHill=make("span","fishing-hill fishing-hill-near");
      const water=make("div","fishing-water");
      const rippleA=make("span","fishing-ripple fishing-ripple-a");
      const rippleB=make("span","fishing-ripple fishing-ripple-b");
      const rippleC=make("span","fishing-ripple fishing-ripple-c");
      const boat=make("div","fishing-boat","🛶");
      const pole=make("div","fishing-pole");
      const float=make("div","fishing-float","●");
      const line=make("div","fishing-line");
      const fishShadow=make("div","fishing-underwater-fish","🐟");
      const shore=make("div","fishing-shore");
      sky.append(sun,cloudA,cloudB,hills);
      hills.append(farHill,nearHill);
      water.append(rippleA,rippleB,rippleC,boat,pole,float,line,fishShadow);
      scene.append(sky,water,shore);
      put(scene);

      const stats=make("div","fishing-stats");
      const moneyEl=make("strong","","🪙 95 zł");
      const caughtEl=make("strong","","🐟 Złowione: 0");
      const rodEl=make("strong","","🎣 Wędka startowa");
      const baitEl=make("strong","","🪱 Robaki");
      stats.append(moneyEl,caughtEl,rodEl,baitEl);
      put(stats);

      const challenge=make("section","fishing-challenge");
      challenge.hidden=true;
      const challengeHeader=make("div","fishing-challenge-header");
      const challengeTitle=make("strong","","BRANIE!");
      const challengeHint=make("span","","Kliknij, gdy wskaźnik trafi w zielone pole.");
      challengeHeader.append(challengeTitle,challengeHint);
      const meter=make("div","fishing-meter-track");
      const target=make("div","fishing-meter-target");
      const needle=make("div","fishing-meter-needle");
      meter.append(target,needle);
      const meterLegend=make("div","fishing-meter-legend");
      meterLegend.append(make("span","","ZA WCZEŚNIE"),make("span","","IDEALNIE"),make("span","","ZA PÓŹNO"));
      const fightStats=make("div","fishing-fight-stats");
      const tensionWrap=make("div","fishing-bar-block");
      const tensionLabel=make("div","fishing-bar-label");
      tensionLabel.append(make("span","","NAPIĘCIE ŻYŁKI"),make("strong","fishing-tension-number","0%"));
      const tensionTrack=make("div","fishing-bar-track");
      const tensionFill=make("div","fishing-bar-fill fishing-tension-fill");
      tensionTrack.append(tensionFill);
      tensionWrap.append(tensionLabel,tensionTrack);
      const progressWrap=make("div","fishing-bar-block");
      const progressLabel=make("div","fishing-bar-label");
      progressLabel.append(make("span","","ZMĘCZENIE RYBY"),make("strong","fishing-progress-number","0%"));
      const progressTrack=make("div","fishing-bar-track");
      const progressFill=make("div","fishing-bar-fill fishing-progress-fill");
      progressTrack.append(progressFill);
      progressWrap.append(progressLabel,progressTrack);
      fightStats.append(tensionWrap,progressWrap);
      const challengeAction=button("ZACIĄGNIJ!","fishing-challenge-action");
      challenge.append(challengeHeader,meter,meterLegend,fightStats,challengeAction);
      put(challenge);

      const actions=make("div","fishing-actions");
      const cast=button("🎣  ZARZUĆ WĘDKĘ","fishing-cast");
      const shopToggle=button("🛒  SKLEP WĘDKARSKI","fishing-shop-toggle");
      actions.append(cast,shopToggle);
      put(actions);

      const shopPanel=make("section","fishing-shop");
      shopPanel.hidden=true;
      const shopHeader=make("div","fishing-shop-header");
      const shopIntro=make("div","fishing-shop-intro");
      shopIntro.append(make("strong","","SKLEP WĘDKARSKI"),make("span","","Zmień sprzęt i przygotuj się na większe okazy."));
      const shopWallet=make("strong","fishing-shop-wallet","🪙 95 zł");
      const shopClose=button("✕","fishing-shop-close");
      shopClose.setAttribute("aria-label","Zamknij sklep");
      shopHeader.append(shopIntro,shopWallet,shopClose);
      const filters=make("div","fishing-shop-filters");
      const filterDefs=[["all","CAŁY SKLEP"],["rod","WĘDKI"],["bait","PRZYNĘTY"],["reel","KOŁOWROTKI"],["line","ŻYŁKI"]];
      filterDefs.forEach((f,i)=>{const b=button(f[1],"fishing-shop-filter"+(i===0?" active":""));b.dataset.shopFilter=f[0];filters.append(b);});
      const shopGrid=make("div","fishing-shop-grid");
      const shopFoot=make("div","fishing-shop-foot","Sprzęt zostaje z Tobą. Kupiony element możesz zakładać bez dodatkowych opłat.");
      shopPanel.append(shopHeader,filters,shopGrid,shopFoot);
      put(shopPanel);
      help("Zarzuć wędkę. Gdy spławik zacznie podskakiwać, zaciągnij w odpowiednim momencie.");

      let saved={money:95,caught:0,owned:{rod:["starter-rod"],bait:["worm-bait"],reel:["basic-reel"],line:["basic-line"]},gear:{rod:"starter-rod",bait:"worm-bait",reel:"basic-reel",line:"basic-line"}};
      try{
        const raw=localStorage.getItem("novydev-fishing-save");
        if(raw){
          const parsed=JSON.parse(raw);
          if(Number.isFinite(parsed.money))saved.money=Math.max(0,Math.floor(parsed.money));
          if(Number.isFinite(parsed.caught))saved.caught=Math.max(0,Math.floor(parsed.caught));
          ["rod","bait","reel","line"].forEach(kind=>{
            if(Array.isArray(parsed.owned?.[kind])){
              const valid=parsed.owned[kind].filter(id=>catalog.some(it=>it.kind===kind&&it.id===id));
              if(!valid.includes(kind==="rod"?"starter-rod":kind==="bait"?"worm-bait":kind==="reel"?"basic-reel":"basic-line"))valid.push(kind==="rod"?"starter-rod":kind==="bait"?"worm-bait":kind==="reel"?"basic-reel":"basic-line");
              saved.owned[kind]=valid;
            }
            const wanted=parsed.gear?.[kind];
            if(catalog.some(it=>it.kind===kind&&it.id===wanted)&&(saved.owned[kind]||[]).includes(wanted))saved.gear[kind]=wanted;
          });
        }
      }catch{}
      let money=saved.money,caught=saved.caught,owned=saved.owned,gear=saved.gear;
      let phase="idle",fish=null,biteTimer=null,needlePct=0,targetCenter=50,targetWidth=24,miniStart=0,lastTensionAt=Date.now(),tension=0,progress=0,hookMisses=0,shopFilter="all",lastActionAt=0;

      const item=(kind)=>catalog.find(it=>it.kind===kind&&it.id===gear[kind]);
      const isOwned=(it)=>(owned[it.kind]||[]).includes(it.id);
      function persist(){
        try{localStorage.setItem("novydev-fishing-save",JSON.stringify({money,caught,owned,gear}));}catch{}
      }
      function renderShop(){
        shopGrid.replaceChildren();
        catalog.filter(it=>shopFilter==="all"||it.kind===shopFilter).forEach(it=>{
          const isEquipped=gear[it.kind]===it.id;
          const hasIt=isOwned(it);
          const card=make("article","fishing-shop-card"+(isEquipped?" equipped":""));
          const top=make("div","fishing-shop-card-top");
          top.append(make("span","fishing-shop-item-icon",it.icon),make("span","fishing-shop-item-type",({rod:"WĘDKA",bait:"PRZYNĘTA",reel:"KOŁOWROTEK",line:"ŻYŁKA"})[it.kind]));
          const name=make("strong","fishing-shop-item-name",it.name);
          const desc=make("p","fishing-shop-item-desc",it.desc);
          const foot=make("div","fishing-shop-card-foot");
          const price=make("span","fishing-shop-price",it.price===0?"DARMOWE":"🪙 "+it.price+" zł");
          const action=button(isEquipped?"✓ ZAŁOŻONE":hasIt?"ZAŁÓŻ":"KUP","fishing-shop-buy");
          action.dataset.shopId=it.id;
          action.disabled=isEquipped||(!hasIt&&money<it.price);
          if(isEquipped)action.classList.add("is-equipped");
          foot.append(price,action);
          card.append(top,name,desc,foot);
          shopGrid.append(card);
        });
        shopWallet.textContent="🪙 "+money+" zł";
      }
      function update(){
        moneyEl.textContent="🪙 "+money+" zł";
        caughtEl.textContent="🐟 Złowione: "+caught;
        rodEl.textContent="🎣 "+item("rod").name;
        baitEl.textContent=item("bait").icon+" "+item("bait").name;
        shopWallet.textContent="🪙 "+money+" zł";
        shopToggle.disabled=phase!=="idle";
        shopToggle.classList.toggle("active",!shopPanel.hidden);
        persist();
        renderShop();
      }
      function hideChallenge(){
        challenge.hidden=true;
        fightStats.hidden=true;
        challenge.classList.remove("is-hooking","is-fighting");
      }
      function clearRound(){
        if(biteTimer!==null){clearTimeout(biteTimer);biteTimer=null;}
        phase="idle";
        fish=null;
        hookMisses=0;
        tension=0;
        progress=0;
        cast.disabled=false;
        cast.textContent="🎣  ZARZUĆ WĘDKĘ";
        shopToggle.disabled=false;
        float.classList.remove("biting");
        scene.classList.remove("fishing-casting","fishing-bite-active","fishing-fight-active");
        hideChallenge();
        updateBars();
        update();
      }
      function showChallenge(type){
        challenge.hidden=false;
        challenge.classList.toggle("is-hooking",type==="hook");
        challenge.classList.toggle("is-fighting",type==="fight");
        fightStats.hidden=type!=="fight";
        if(type==="hook"){
          challengeTitle.textContent="BRANIE! ZACINAJ!";
          challengeHint.textContent="Naciśnij, gdy biały wskaźnik wejdzie w zielone pole.";
          challengeAction.textContent="🎯  ZACIĄGNIJ!";
        }else{
          challengeTitle.textContent="RYBA NA HACZYKU!";
          challengeHint.textContent="Klikaj w zielonym polu, by holować. Nie zerwij żyłki!";
          challengeAction.textContent="🎣  HOLUJ RYBĘ";
        }
      }
      function updateBars(){
        const max=item("line").strength;
        tensionFill.style.width=Math.max(0,Math.min(100,tension/max*100))+"%";
        tensionWrap.classList.toggle("danger",tension/max>.72);
        tensionWrap.classList.toggle("critical",tension/max>.9);
        progressFill.style.width=Math.max(0,Math.min(100,progress))+"%";
        tensionLabel.lastElementChild.textContent=Math.round(Math.max(0,tension/max*100))+"%";
        progressLabel.lastElementChild.textContent=Math.round(progress)+"%";
      }
      function computeTarget(){
        const now=Date.now();
        const elapsed=now-miniStart;
        const period=phase==="hook"?1450:1650;
        const cycle=(elapsed%period)/period;
        needlePct=(cycle<.5?cycle*200:(1-cycle)*200);
        const power=item("rod").power;
        const control=item("reel").control;
        if(phase==="hook")targetWidth=Math.max(17,23+power*2+control*1.5);
        else targetWidth=Math.max(12,22-(fish?fish.diff:1)*3.5+power*2.3+control*2);
        const sway=phase==="hook"?6:10;
        targetCenter=50+Math.sin(now/(phase==="hook"?720:1100))*sway;
        targetCenter=Math.max(targetWidth/2+2,Math.min(98-targetWidth/2,targetCenter));
        target.style.left=(targetCenter-targetWidth/2)+"%";
        target.style.width=targetWidth+"%";
        needle.style.left=needlePct+"%";
      }
      function chooseFish(){
        const bait=item("bait");
        const luck=bait.luck+item("rod").power*.065;
        const weights=species.map(s=>s.weight/(1+Math.max(0,s.rarity-1)*.24)*(1+luck*s.rarity*1.8));
        const total=weights.reduce((sum,n)=>sum+n,0);
        let n=Math.random()*total;
        for(let i=0;i<species.length;i++){n-=weights[i];if(n<=0)return species[i];}
        return species[0];
      }
      function escapeFish(message){
        const escaped=fish;
        clearRound();
        scene.classList.add("fishing-escape");
        if(escaped)fishShadow.textContent=escaped.emoji;
        say(message||"Ryba uciekła. Spróbuj ponownie!");
        later(()=>{scene.classList.remove("fishing-escape");fishShadow.textContent="🐟";},1050);
      }
      function landFish(){
        const landed=fish;
        const weight=Number((.45+Math.random()*1.25+item("rod").power*.12).toFixed(1));
        const gain=Math.round(landed.price*weight+item("rod").power*5+item("bait").bonus);
        money+=gain;
        caught++;
        clearRound();
        scene.classList.add("fishing-landed");
        const catchFlash=make("div","fishing-catch-flash",landed.emoji+"  "+landed.name+" · "+weight+" kg");
        scene.append(catchFlash);
        say("Złowiono "+landed.name+" ("+weight+" kg) — +"+gain+" zł!");
        later(()=>{catchFlash.remove();scene.classList.remove("fishing-landed");},1900);
        update();
      }
      function actChallenge(){
        if(phase!=="hook"&&phase!=="fight")return;
        const now=Date.now();
        if(now-lastActionAt<260)return;
        lastActionAt=now;
        const hit=Math.abs(needlePct-targetCenter)<=targetWidth/2;
        if(phase==="hook"){
          if(hit){
            if(biteTimer!==null){clearTimeout(biteTimer);biteTimer=null;}
            phase="fight";
            miniStart=Date.now();
            tension=24;
            progress=0;
            lastTensionAt=Date.now();
            showChallenge("fight");
            scene.classList.remove("fishing-bite-active");
            scene.classList.add("fishing-fight-active");
            say("Jest na haczyku! Prowadź rybę spokojnie.");
            updateBars();
          }else{
            hookMisses++;
            if(hookMisses>=3)escapeFish("Nie udało się zaciąć — ryba odpłynęła.");
            else say("Pudło! Jeszcze "+(3-hookMisses)+" próby zacięcia.");
          }
          return;
        }
        if(hit){
          const diff=fish?fish.diff:1;
          progress=Math.min(100,progress+Math.max(14,30/diff+item("rod").power*3+item("reel").control*2));
          tension+=7+diff*2.1;
          say(progress>=100?"Ryba jest już blisko!": "Dobry ruch! Holujesz rybę…");
        }else{
          progress=Math.max(0,progress-6);
          tension+=17+(fish?fish.diff:1)*3;
          say("Nie trafiono w zielone pole — rośnie napięcie żyłki!");
        }
        updateBars();
        if(tension>=item("line").strength){
          escapeFish("TRACH! Żyłka pękła i ryba uciekła.");
          return;
        }
        if(progress>=100)landFish();
      }
      function castLine(){
        if(phase!=="idle")return;
        shopPanel.hidden=true;
        shopToggle.classList.remove("active");
        phase="waiting";
        cast.disabled=true;
        shopToggle.disabled=true;
        cast.textContent="🌊  CZEKAJ NA BRANIE…";
        scene.classList.add("fishing-casting");
        say("Wędka leci do wody… obserwuj spławik.");
        update();
        later(()=>scene.classList.remove("fishing-casting"),850);
        const wait=(1900+Math.random()*3000)*item("bait").wait*(1-item("rod").power*.045);
        biteTimer=later(()=>{
          if(phase!=="waiting")return;
          fish=chooseFish();
          phase="hook";
          miniStart=Date.now();
          hookMisses=0;
          float.classList.add("biting");
          scene.classList.add("fishing-bite-active");
          showChallenge("hook");
          cast.textContent="🐟  BRANIE!";
          say("BRANIE! Wskaźnik pędzi — zaciągnij w zielonym polu.");
          biteTimer=later(()=>{if(phase==="hook")escapeFish("Za długo zwlekałeś — ryba uciekła!");},6800);
        },wait);
      }
      function useItem(it){
        if(isOwned(it)){
          gear[it.kind]=it.id;
          update();
          say("Założono: "+it.name+".");
          return;
        }
        if(money<it.price){say("Brakuje "+(it.price-money)+" zł na "+it.name+".");return;}
        money-=it.price;
        owned[it.kind].push(it.id);
        gear[it.kind]=it.id;
        update();
        say("Kupiono i założono: "+it.name+"!");
      }
      function setFilter(filter){
        shopFilter=filter;
        [...filters.querySelectorAll("[data-shop-filter]")].forEach(b=>b.classList.toggle("active",b.dataset.shopFilter===filter));
        renderShop();
      }
      on(cast,"click",castLine);
      on(challengeAction,"click",actChallenge);
      on(shopToggle,"click",()=>{if(phase!=="idle")return;shopPanel.hidden=!shopPanel.hidden;shopToggle.classList.toggle("active",!shopPanel.hidden);if(!shopPanel.hidden)renderShop();});
      on(shopClose,"click",()=>{shopPanel.hidden=true;shopToggle.classList.remove("active");});
      on(filters,"click",e=>{const b=e.target.closest("[data-shop-filter]");if(b)setFilter(b.dataset.shopFilter);});
      on(shopGrid,"click",e=>{const b=e.target.closest("[data-shop-id]");if(!b)return;const it=catalog.find(it=>it.id===b.dataset.shopId);if(it)useItem(it);});
      on(reset,"click",()=>{clearRound();shopPanel.hidden=true;shopToggle.classList.remove("active");say("Gotowy na następny rzut. Twój sprzęt i oszczędności zostały zachowane.");});
      every(()=>{
        if(phase==="hook"||phase==="fight"){
          computeTarget();
          if(phase==="fight"){
            const now=Date.now();
            const dt=Math.min(.12,(now-lastTensionAt)/1000);
            lastTensionAt=now;
            tension=Math.max(0,tension-(11+item("reel").control*3)*dt);
            if(tension>=item("line").strength){escapeFish("Żyłka nie wytrzymała holowania!");return;}
            updateBars();
          }
        }
      },35);
      update();
      renderShop();
      say("Gotowy na połów. Zarzuć wędkę, a potem wykaż się refleksem.");
    }

    function racerGame(){
      const canvas=make("canvas","arcade-canvas racer-canvas");canvas.width=420;canvas.height=620;canvas.tabIndex=0;canvas.setAttribute("aria-label","Neon Racer — steruj autem i omijaj ruch uliczny");put(canvas);
      const ctx=canvas.getContext("2d");
      const cars=[
        {id:"pink",name:"PINK PULSE",color:"#ff3eaa",price:0,desc:"Startowy neonowy samochód."},
        {id:"cyan",name:"CYBER BLUE",color:"#00eaff",price:80,desc:"Chłodny błękit i mocna poświata."},
        {id:"lime",name:"VOLT GREEN",color:"#b7ff4a",price:160,desc:"Jaskrawa zieleń na nocnej trasie."},
        {id:"violet",name:"PURPLE HAZE",color:"#a56bff",price:280,desc:"Fioletowy lakier z neonowym blaskiem."},
        {id:"gold",name:"GOLD RUSH",color:"#ffcf55",price:450,desc:"Złoty lakier dla mistrzów autostrady."}
      ];
      const bestValue=Number(localStorage.getItem("novydev-racer-best")||0);let best=Number.isFinite(bestValue)?Math.max(0,bestValue):0;
      let stored={credits:0,owned:["pink"],selected:"pink"};
      try{const raw=localStorage.getItem("novydev-racer-save");if(raw){const parsed=JSON.parse(raw);if(Number.isFinite(parsed.credits))stored.credits=Math.max(0,Math.floor(parsed.credits));if(Array.isArray(parsed.owned))stored.owned=parsed.owned.filter(id=>cars.some(c=>c.id===id));if(typeof parsed.selected==="string")stored.selected=parsed.selected;}}catch{}
      let credits=stored.credits;const owned=[...new Set(["pink",...stored.owned])];
      let activeCar=cars.find(c=>c.id===stored.selected&&owned.includes(c.id))||cars[0];
      let x=210,targetX=210,traffic=[],pickups=[],particles=[],score=0,speed=250,started=false,ended=false,last=0,spawn=0,coinSpawn=.5,roadOffset=0,keys=new Set(),pointerDown=false;
      const actions=make("div","racer-actions"),garageToggle=button("🚘  GARAŻ NEONOWY","arcade-btn racer-garage-toggle");
      actions.append(garageToggle);put(actions);
      const garage=make("section","racer-garage");garage.hidden=true;
      const garageHeader=make("div","racer-garage-header"),garageIntro=make("div","racer-garage-intro");
      garageIntro.append(make("strong","","GARAŻ NEONOWY"),make("span","","Odblokuj własny kolor auta za kredyty zebrane na trasie."));
      const garageWallet=make("strong","racer-garage-wallet","🪙 "+credits),garageClose=button("✕","arcade-btn racer-garage-close");
      garageClose.setAttribute("aria-label","Zamknij garaż");garageHeader.append(garageIntro,garageWallet,garageClose);
      const garageGrid=make("div","racer-garage-grid"),garageFoot=make("p","racer-garage-foot","Zbieraj świecące żetony na drodze. Zakupione samochody zostają odblokowane.");
      garage.append(garageHeader,garageGrid,garageFoot);put(garage);
      function persist(){try{localStorage.setItem("novydev-racer-save",JSON.stringify({credits,owned,selected:activeCar.id}));localStorage.setItem("novydev-racer-best",String(Math.floor(best)));}catch{}}
      function renderGarage(){
        garageGrid.replaceChildren();
        cars.forEach(item=>{
          const hasCar=owned.includes(item.id),selected=activeCar.id===item.id;
          const card=make("article","racer-car-card"+(selected?" selected":"")+(hasCar?"":" locked"));
          const top=make("div","racer-car-card-top"),swatch=make("span","racer-car-swatch");
          swatch.style.backgroundColor=item.color;swatch.style.boxShadow="0 0 16px "+item.color+"55";
          const preview=make("span","racer-car-preview","🚘");preview.style.color=item.color;top.append(preview,swatch);
          const name=make("strong","racer-car-name",item.name),desc=make("p","racer-car-desc",item.desc);
          const action=button(selected?"✓ WYBRANO":hasCar?"WYBIERZ":"KUP · "+item.price+" 🪙","arcade-btn racer-garage-buy");
          action.dataset.racerCar=item.id;action.disabled=selected;card.append(top,name,desc,action);garageGrid.append(card);
        });
        garageWallet.textContent="🪙 "+credits+" kredytów";
      }
      function fresh(){
        x=210;targetX=210;traffic=[];pickups=[];particles=[];score=0;speed=250;started=false;ended=false;last=0;spawn=0;coinSpawn=.5;roadOffset=0;keys.clear();pointerDown=false;
        garageToggle.disabled=false;draw();say("Dotknij, aby wystartować");
      }
      function burst(px,py,color,count){
        for(let i=0;i<count;i++){const angle=Math.random()*Math.PI*2,force=25+Math.random()*145;particles.push({x:px,y:py,vx:Math.cos(angle)*force,vy:Math.sin(angle)*force,life:.35+Math.random()*.48,color,size:2+Math.random()*3});}
      }
      function car(cx,cy,color,hero=false,phase=0){
        ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.sin(performance.now()/300+phase)*(hero ? 0.006 : 0.012));
        ctx.shadowColor=color;ctx.shadowBlur=hero?22:10;ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(-22,-39,44,78,9);ctx.fill();
        ctx.shadowBlur=0;ctx.fillStyle="#101321";ctx.beginPath();ctx.roundRect(-15,-25,30,19,5);ctx.fill();ctx.fillRect(-15,10,30,15);
        ctx.fillStyle=hero?"#f8faff":"#ffd166";ctx.fillRect(-18,-33,9,5);ctx.fillRect(9,-33,9,5);
        ctx.fillStyle=hero?"#ffef9a":"#ff536f";ctx.fillRect(-17,28,8,5);ctx.fillRect(9,28,8,5);
        ctx.fillStyle="#080a12";ctx.fillRect(-26,-24,5,18);ctx.fillRect(21,-24,5,18);ctx.fillRect(-26,14,5,18);ctx.fillRect(21,14,5,18);
        if(hero){ctx.globalAlpha=.17;ctx.fillStyle=color;ctx.fillRect(-12,42,24,38);}ctx.restore();
      }
      function drawPickup(c){
        ctx.save();ctx.translate(c.x,c.y);ctx.rotate(Math.sin(c.phase)*.12);ctx.shadowColor="#ffcf55";ctx.shadowBlur=20;ctx.fillStyle="#ffcf55";ctx.beginPath();ctx.arc(0,0,13+Math.sin(c.phase)*1.4,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;ctx.strokeStyle="#fff2b5";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#60400c";ctx.font="bold 14px ui-monospace,monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("+",0,.5);ctx.restore();
      }
      function draw(){
        const g=ctx.createLinearGradient(0,0,0,620);g.addColorStop(0,"#100b2b");g.addColorStop(1,"#050711");ctx.fillStyle=g;ctx.fillRect(0,0,420,620);
        ctx.fillStyle="#141a2d";ctx.fillRect(35,0,350,620);
        for(let i=0;i<14;i++){const y=(i*54+roadOffset*1.15)%660-30;ctx.fillStyle=i%2?"rgba(0,234,255,.16)":"rgba(255,62,170,.18)";ctx.fillRect(43,y,5,20);ctx.fillRect(372,y,5,20);}
        ctx.strokeStyle="#00eaff";ctx.lineWidth=3;ctx.strokeRect(35,0,350,620);
        ctx.strokeStyle="rgba(255,255,255,.38)";ctx.lineWidth=3;ctx.setLineDash([30,28]);ctx.lineDashOffset=-(roadOffset%58);
        ctx.beginPath();ctx.moveTo(151,0);ctx.lineTo(151,620);ctx.moveTo(269,0);ctx.lineTo(269,620);ctx.stroke();ctx.setLineDash([]);
        pickups.forEach(drawPickup);traffic.forEach(t=>car(t.x,t.y,t.color,false,t.phase));
        if(started&&!ended){ctx.save();ctx.globalAlpha=.22;ctx.strokeStyle=activeCar.color;ctx.lineWidth=2;for(let i=0;i<4;i++){const yy=490+i*23+(roadOffset%23);ctx.beginPath();ctx.moveTo(x-13,yy);ctx.lineTo(x-13,yy+12);ctx.moveTo(x+13,yy);ctx.lineTo(x+13,yy+12);ctx.stroke();}ctx.restore();}
        particles.forEach(p=>{ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,p.life/.5));ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.restore();});
        car(x,520,activeCar.color,true);
        ctx.textBaseline="alphabetic";ctx.textAlign="left";ctx.fillStyle="#fff";ctx.font="bold 13px ui-monospace,monospace";ctx.fillText("DIST "+Math.floor(score)+" m",13,24);ctx.fillText("BEST "+Math.floor(best)+" m",269,24);
        ctx.fillStyle="#ffcf55";ctx.fillText("CREDITS "+credits,14,45);
        if(!started||ended){ctx.fillStyle="rgba(4,6,18,.84)";ctx.fillRect(45,238,330,142);ctx.textAlign="center";ctx.fillStyle=ended?"#ff6b8d":"#00eaff";ctx.font="bold 23px ui-monospace,monospace";ctx.fillText(ended?"KOLIZJA!":"NEON RACER",210,278);ctx.fillStyle="#fff";ctx.font="12px ui-monospace,monospace";ctx.fillText(ended?"Wynik: "+Math.floor(score)+" m":"Dotknij lub użyj A/D · ← →",210,308);ctx.fillStyle="#b8c2d4";ctx.font="11px ui-monospace,monospace";ctx.fillText(ended?"Naciśnij, aby spróbować ponownie":"Zbieraj złote żetony · omijaj auta",210,333);ctx.textAlign="left";}
      }
      function beginRun(){fresh();started=true;garage.hidden=true;garageToggle.classList.remove("active");garageToggle.disabled=true;say("Uważaj na ruch! Zbieraj złote żetony.");}
      function steerToPointer(e){const rect=canvas.getBoundingClientRect();if(!rect.width)return;const px=(e.clientX-rect.left)*canvas.width/rect.width;targetX=x=Math.max(67,Math.min(353,px));}
      function tick(t){
        if(destroyed)return;const dt=Math.min(.04,(t-(last||t))/1000);last=t;
        if(started&&!ended){
          const steer=(keys.has("ArrowLeft")||keys.has("KeyA")?-1:0)+(keys.has("ArrowRight")||keys.has("KeyD")?1:0);
          if(steer){x=Math.max(67,Math.min(353,x+steer*460*dt));targetX=x;}spawn+=dt;
          if(spawn>Math.max(.48,.9-score/2600)){spawn=0;traffic.push({x:66+Math.random()*288,y:-70,color:["#ff4b6e","#a56bff","#ffb84d","#52ffb8"][Math.floor(Math.random()*4)],factor:.78+Math.random()*.34,phase:Math.random()*8});}
          coinSpawn+=dt;if(coinSpawn>1.45){coinSpawn=0;pickups.push({x:72+Math.random()*276,y:-35,value:10,phase:Math.random()*Math.PI*2});}
          speed=Math.min(560,250+score*.15);roadOffset+=speed*dt;traffic.forEach(a=>a.y+=speed*(a.factor||1)*dt);traffic=traffic.filter(a=>a.y<690);
          let collected=false;const remaining=[];
          pickups.forEach(c=>{c.y+=speed*dt;c.phase+=dt*5;if(Math.abs(c.x-x)<31&&Math.abs(c.y-520)<34){credits+=c.value;burst(c.x,c.y,"#ffcf55",10);say("+"+c.value+" kredytów! Świetny przejazd.");collected=true;}else if(c.y<690)remaining.push(c);});
          pickups=remaining;if(collected){persist();garageWallet.textContent="🪙 "+credits+" kredytów";}
          score+=dt*speed*.18;let crashed=false;
          for(const a of traffic){if(Math.abs(a.x-x)<40&&Math.abs(a.y-520)<65){ended=true;crashed=true;break;}}
          if(crashed){best=Math.max(best,score);persist();burst(x,520,activeCar.color,24);garageToggle.disabled=false;say("Kolizja! Wynik: "+Math.floor(score)+" m. Spróbuj ponownie.");}
        }
        particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);
        draw();raf=requestAnimationFrame(tick);
      }
      const kd=e=>{if(!["ArrowLeft","ArrowRight","KeyA","KeyD","Space"].includes(e.code))return;e.preventDefault();if(!garage.hidden)return;if(!started||ended)beginRun();if(e.code==="ArrowLeft"||e.code==="KeyA")keys.add(e.code);if(e.code==="ArrowRight"||e.code==="KeyD")keys.add(e.code);};
      const ku=e=>keys.delete(e.code);on(window,"keydown",kd,true);on(window,"keyup",ku,true);
      on(canvas,"pointerdown",e=>{if(!garage.hidden)return;e.preventDefault();canvas.focus();if(!started||ended)beginRun();pointerDown=true;try{canvas.setPointerCapture(e.pointerId);}catch{}steerToPointer(e);});
      on(canvas,"pointermove",e=>{if(pointerDown&&!garage.hidden){e.preventDefault();steerToPointer(e);}});
      const endPointer=e=>{pointerDown=false;try{if(e&&canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}catch{}};on(canvas,"pointerup",endPointer);on(canvas,"pointercancel",endPointer);on(window,"pointerup",endPointer);
      on(garageToggle,"click",()=>{if(started&&!ended)return;garage.hidden=!garage.hidden;garageToggle.classList.toggle("active",!garage.hidden);if(!garage.hidden){renderGarage();say("Wybierz lakier w garażu.");}else say("Gotowy do wyścigu.");});
      on(garageClose,"click",()=>{garage.hidden=true;garageToggle.classList.remove("active");say("Gotowy do wyścigu.");});
      on(garageGrid,"click",e=>{
        const b=e.target.closest("[data-racer-car]");if(!b)return;const item=cars.find(c=>c.id===b.dataset.racerCar);if(!item)return;
        if(!owned.includes(item.id)){if(credits<item.price){say("Potrzebujesz jeszcze "+(item.price-credits)+" kredytów.");return;}credits-=item.price;owned.push(item.id);activeCar=item;persist();renderGarage();say("Odblokowano "+item.name+"!");}
        else{activeCar=item;persist();renderGarage();say("Wybrano "+item.name+".");}
      });
      on(reset,"click",()=>{fresh();garage.hidden=true;garageToggle.classList.remove("active");say("Nowy wyścig gotowy.");});
      fresh();renderGarage();help("Steruj swobodnie w lewo i prawo: A/D, strzałki albo przesuwaj palcem po drodze. Auta i żetony pojawiają się w różnych miejscach, nie tylko na pasach. Rekord i garaż zapisują się na urządzeniu.");raf=requestAnimationFrame(tick);
    }

    function invadersGame(){
      const canvas=make("canvas","arcade-canvas invaders-canvas");canvas.width=720;canvas.height=500;canvas.tabIndex=0;put(canvas);const ctx=canvas.getContext("2d");
      let ship=360,shots=[],aliens=[],enemyShots=[],score=0,lives=3,dir=1,step=0,ended=false,keys=new Set(),last=0,fire=0;
      function formation(){aliens=[];for(let r=0;r<4;r++)for(let c=0;c<9;c++)aliens.push({x:100+c*58,y:65+r*48,alive:true,row:r});}
      function fresh(){ship=360;shots=[];enemyShots=[];score=0;lives=3;dir=1;step=0;ended=false;last=0;fire=0;keys.clear();formation();say("← → / A D • SPACJA = strzał");draw();}
      function draw(){const g=ctx.createLinearGradient(0,0,0,500);g.addColorStop(0,"#090c24");g.addColorStop(1,"#03070d");ctx.fillStyle=g;ctx.fillRect(0,0,720,500);for(let i=0;i<90;i++){ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillRect((i*83)%720,(i*47)%500,2,2);}ctx.strokeStyle="rgba(0,234,255,.15)";ctx.beginPath();ctx.moveTo(0,465);ctx.lineTo(720,465);ctx.stroke();aliens.forEach((a,i)=>{if(!a.alive)return;ctx.fillStyle=["#b7ff4a","#4ee9ff","#ff5da2","#b18cff"][a.row];ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.fillRect(a.x,a.y,29,18);ctx.fillRect(a.x+5,a.y-5,5,5);ctx.fillRect(a.x+19,a.y-5,5,5);ctx.fillRect(a.x+5,a.y+17,5,5);ctx.fillRect(a.x+19,a.y+17,5,5);ctx.shadowBlur=0;ctx.fillStyle="#071018";ctx.fillRect(a.x+6,a.y+5,4,4);ctx.fillRect(a.x+19,a.y+5,4,4);});ctx.fillStyle="#f5f7ff";shots.forEach(s=>ctx.fillRect(s.x-2,s.y-9,4,12));ctx.fillStyle="#ff5da2";enemyShots.forEach(s=>ctx.fillRect(s.x-3,s.y,6,12));ctx.fillStyle="#00eaff";ctx.shadowColor="#00eaff";ctx.shadowBlur=16;ctx.beginPath();ctx.moveTo(ship,440);ctx.lineTo(ship-23,470);ctx.lineTo(ship+23,470);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#fff";ctx.font="bold 15px ui-monospace,monospace";ctx.fillText("WYNIK "+score+"    ŻYCIA "+lives,16,25);if(ended||!aliens.some(a=>a.alive)){ctx.fillStyle="rgba(0,0,0,.7)";ctx.fillRect(150,205,420,100);ctx.textAlign="center";ctx.fillStyle="#00eaff";ctx.font="bold 24px ui-monospace,monospace";ctx.fillText(aliens.some(a=>a.alive)?"KONIEC GRY":"SEKTOR OCZYSZCZONY",360,245);ctx.fillStyle="#fff";ctx.font="13px ui-monospace,monospace";ctx.fillText("Wynik: "+score+" • kliknij OD NOWA",360,274);ctx.textAlign="left";}}
      function tick(t){if(destroyed)return;const dt=Math.min(.04,(t-(last||t))/1000);last=t;if(!ended){if(keys.has("ArrowLeft")||keys.has("KeyA"))ship=Math.max(28,ship-300*dt);if(keys.has("ArrowRight")||keys.has("KeyD"))ship=Math.min(692,ship+300*dt);shots.forEach(s=>s.y-=440*dt);enemyShots.forEach(s=>s.y+=200*dt);shots=shots.filter(s=>s.y>-20);enemyShots=enemyShots.filter(s=>s.y<520);step+=dt;const alive=aliens.filter(a=>a.alive);if(step>.48){step=0;let edge=false;alive.forEach(a=>{a.x+=dir*13;if(a.x<8||a.x>683)edge=true;});if(edge){dir*=-1;alive.forEach(a=>a.y+=13);}}fire+=dt;if(fire>Math.max(.35,1.1-alive.length*.01)){fire=0;if(alive.length){const a=alive[Math.floor(Math.random()*alive.length)];enemyShots.push({x:a.x+14,y:a.y+20});}}shots.forEach(s=>{const a=aliens.find(a=>a.alive&&s.x>a.x-4&&s.x<a.x+33&&s.y>a.y-6&&s.y<a.y+26);if(a){a.alive=false;s.y=-50;score+=10;}});enemyShots.forEach(s=>{if(Math.abs(s.x-ship)<23&&s.y>438&&s.y<472){s.y=550;lives--;if(lives<=0)ended=true;}});if(!aliens.some(a=>a.alive)){ended=true;say("Sektor oczyszczony!");}if(alive.some(a=>a.y>415))ended=true;}draw();raf=requestAnimationFrame(tick);}
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