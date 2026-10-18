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
    whack: ["WHACK-A-MOLE", "Klikaj pojawiający się cel, zanim zniknie."]
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
      function render(){grid.replaceChildren();cards.forEach(c=>{const b=button(c.open||c.match?c.s:"?","memory-card"+(c.match?" matched":"")+(c.open?" open":""));b.disabled=c.match;b.setAttribute("aria-label",c.open||c.match?c.s:"Zakryta karta");on(b,"click",()=>flip(c));grid.append(b);});movesEl.textContent="Ruchy: "+moves;pairsEl.textContent="Pary: "+pairs+"/8";}
      function flip(c){if(locked||c.open||c.match)return;c.open=true;if(!first){first=c;render();return;}moves++;if(first.s===c.s){first.match=c.match=true;first=null;pairs++;render();if(pairs===8)say("Wygrana! Liczba ruchów: "+moves);}else{const old=first;first=null;locked=true;render();later(()=>{old.open=false;c.open=false;locked=false;render();},650);}}
      on(reset,"click",deal);deal();
    }

    function minesGame(){
      const n=9,total=81,mineCount=10;let cells=[],flagMode=false,ended=false,revealed=0;
      const grid=make("div","mines-grid"),line=make("div","arcade-score-line"),flag=button("🚩 TRYB FLAGI","arcade-btn"),counter=make("span","","Flagi: 0/10");line.append(flag,counter);put(line);put(grid);help("Kliknij pole, aby odkryć. Włącz tryb flagi, aby oznaczać miny.");
      function fresh(){cells=Array.from({length:total},()=>({mine:false,open:false,flag:false,near:0}));let count=0;while(count<mineCount){let i=Math.floor(Math.random()*total);if(!cells[i].mine){cells[i].mine=true;count++;}}cells.forEach((c,i)=>{if(c.mine)return;let r=Math.floor(i/n),col=i%n;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){let rr=r+dr,cc=col+dc;if(rr>=0&&rr<n&&cc>=0&&cc<n&&cells[rr*n+cc].mine)c.near++;}});flagMode=false;ended=false;revealed=0;flag.classList.remove("active");flag.textContent="🚩 TRYB FLAGI";render();say("Powodzenia!");}
      function render(){grid.replaceChildren();cells.forEach((c,i)=>{const b=button(c.flag?"🚩":c.open?(c.mine?"💣":c.near?String(c.near):""):"","mine-cell"+(c.open?" revealed":"")+(c.mine&&ended?" exploded":""));if(c.open&&!c.mine&&c.near)b.dataset.n=String(c.near);b.disabled=c.open||ended;on(b,"click",()=>act(i));on(b,"contextmenu",e=>{e.preventDefault();toggleFlag(i);});grid.append(b);});counter.textContent="Flagi: "+cells.filter(c=>c.flag).length+"/"+mineCount;}
      function toggleFlag(i){if(ended||cells[i].open)return;cells[i].flag=!cells[i].flag;render();}
      function reveal(i){const c=cells[i];if(c.open||c.flag||ended)return;c.open=true;revealed++;if(c.mine){ended=true;cells.forEach(x=>{if(x.mine)x.open=true;});say("BUM! Naciśnij OD NOWA.");return;}if(!c.near){const r=Math.floor(i/n),col=i%n;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){let rr=r+dr,cc=col+dc;if(rr>=0&&rr<n&&cc>=0&&cc<n)reveal(rr*n+cc);}}}
      function act(i){if(flagMode){toggleFlag(i);return;}reveal(i);if(!ended&&revealed===total-mineCount){ended=true;say("Wygrana! Wszystkie bezpieczne pola odkryte.");}render();}
      on(flag,"click",()=>{flagMode=!flagMode;flag.classList.toggle("active",flagMode);flag.textContent=flagMode?"✓ TRYB FLAGI":"🚩 TRYB FLAGI";});on(reset,"click",fresh);fresh();
    }

    function ticTacToe(){
      let board=[],turn="X",ended=false,scores=[0,0];
      const grid=make("div","ttt-grid"),line=make("div","arcade-score-line"),score=make("span","","X: 0 • O: 0"),next=button("NOWA RUNDA","arcade-btn");line.append(score,next);put(line);put(grid);help("Dla dwóch graczy — zmieniajcie się na jednym ekranie.");
      const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      function winner(){return wins.find(a=>board[a[0]]&&board[a[0]]===board[a[1]]&&board[a[1]]===board[a[2]]);}
      function fresh(){board=Array(9).fill("");turn="X";ended=false;render();say("Ruch: X");}
      function render(){grid.replaceChildren();board.forEach((v,i)=>{const b=button(v,"ttt-cell"+(v?" "+v.toLowerCase():""));b.disabled=ended||!!v;on(b,"click",()=>play(i));grid.append(b);});score.textContent="X: "+scores[0]+" • O: "+scores[1];}
      function play(i){if(ended||board[i])return;board[i]=turn;const w=winner();if(w){ended=true;scores[turn==="X"?0:1]++;render();say("Wygrywa "+turn+"!");}else if(board.every(Boolean)){ended=true;render();say("Remis!");}else{turn=turn==="X"?"O":"X";render();say("Ruch: "+turn);}}
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
      function render(){grid.replaceChildren();for(let i=0;i<9;i++){const b=button(active===i?"🐹":"", "whack-hole"+(active===i?" mole":""));on(b,"click",()=>{if(!running||active!==i)return;score++;sc.textContent="Punkty: "+score;active=-1;render();});grid.append(b);}tm.textContent="Czas: "+remaining+" s";}
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
      function fresh(){scores=[0,0];p1=p2=210;live=true;last=0;keys.clear();serve(Math.random()<.5?1:-1);say("Gra trwa");draw();raf=requestAnimationFrame(tick);}
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
    }
    init();
    return {destroy(){if(destroyed)return;destroyed=true;if(raf)cancelAnimationFrame(raf);timers.forEach(clearTimeout);intervals.forEach(clearInterval);cleanup.forEach(fn=>{try{fn();}catch{}});try{if(audio)audio.close();}catch{}root.replaceChildren();root.classList.remove("arcade-root");}};
  };
})();