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
    mario: ["MARIO ADVENTURE", "Klasyczna platformówka 2D: bieganie, skoki, monety, bloki i przeciwnicy."],
    fishing: ["FISHING SIMULATOR", "Zarzuć wędkę, wyczuj branie i zbieraj ryby na ulepszenia."],
    racer: ["NEON RACER", "Omijaj ruch uliczny na neonowej autostradzie i pobij rekord."],
    invaders: ["SPACE INVADERS", "Broń Ziemi przed falami kosmitów. Strzelaj i unikaj pocisków."],
    tactical: ["TACTICAL STRIKE", "Taktyczna strzelanka na PC — walcz z botami na arenie."]
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
      function spawn(){const empty=[];board.forEach((v,i)=>{if(!v)empty.push(i);});if(!empty.length)return -1;const index=empty[Math.floor(Math.random()*empty.length)];board[index]=Math.random()<.9?2:4;return index;}
      function render(animate=false,mergedIndices=[],spawnedIndex=-1){
        const oldTiles=Array.from(grid.children).map((el,index)=>({value:Number(el.textContent)||0,index,rect:el.getBoundingClientRect()}));
        grid.replaceChildren();
        const newTiles=[];
        board.forEach((v,index)=>{
          const tile=make("div","tile-2048"+(v?" v"+Math.min(v,2048):"")+(animate&&mergedIndices.includes(index)?" tile-merge":"")+(animate&&spawnedIndex===index?" tile-spawn":""),v?String(v):"");
          tile.dataset.index=String(index);grid.append(tile);newTiles.push({el:tile,value:v,index});
        });
        if(animate){
          const used=new Set();
          newTiles.forEach(tile=>{
            if(!tile.value||mergedIndices.includes(tile.index)||spawnedIndex===tile.index)return;
            const rect=tile.el.getBoundingClientRect();
            const candidates=oldTiles.filter(old=>old.value===tile.value&&!used.has(old.index));
            if(!candidates.length)return;
            candidates.sort((x,y)=>((x.rect.left-rect.left)**2+(x.rect.top-rect.top)**2)-((y.rect.left-rect.left)**2+(y.rect.top-rect.top)**2));
            const source=candidates[0];used.add(source.index);
            const dx=source.rect.left-rect.left,dy=source.rect.top-rect.top;
            if(Math.abs(dx)+Math.abs(dy)<1)return;
            tile.el.style.transition="none";tile.el.style.transform=`translate(${dx}px,${dy}px)`;
            requestAnimationFrame(()=>{if(!destroyed){tile.el.style.transition="transform 190ms cubic-bezier(.2,.8,.2,1)";tile.el.style.transform="translate(0,0)";}});
          });
        }
        scoreText.textContent="Wynik: "+score;bestText.textContent="Rekord: "+Number(localStorage.getItem("novydev-2048-best")||0);
      }
      function fresh(){board=Array(16).fill(0);score=0;ended=false;won=false;spawn();spawn();render();say("Połącz kafelki");}
      function canMove(){for(let r=0;r<4;r++)for(let c=0;c<4;c++){let i=r*4+c;if(c<3&&board[i]===board[i+1]||r<3&&board[i]===board[i+4])return true;}return false;}
      function move(dir){
        if(ended)return;const before=board.join(",");const mergedIndices=[];
        for(let lineNo=0;lineNo<4;lineNo++){
          let idx=[];
          for(let p=0;p<4;p++){let r,c;if(dir==="left"){r=lineNo;c=p;}else if(dir==="right"){r=lineNo;c=3-p;}else if(dir==="up"){r=p;c=lineNo;}else{r=3-p;c=lineNo;}idx.push(r*4+c);}
          let vals=idx.map(i=>board[i]).filter(Boolean);
          for(let i=0;i<vals.length-1;i++)if(vals[i]===vals[i+1]){vals[i]*=2;score+=vals[i];vals.splice(i+1,1);if(vals[i]===2048&&!won){won=true;say("2048! Możesz grać dalej.");}}
          while(vals.length<4)vals.push(0);let sourceVals=idx.map(i=>board[i]).filter(Boolean),write=0;for(let i=0;i<sourceVals.length-1;i++){if(sourceVals[i]===sourceVals[i+1]){mergedIndices.push(idx[write]);i++;}write++;}idx.forEach((n,i)=>board[n]=vals[i]);
        }
        if(before===board.join(","))return;const spawnedIndex=spawn();render(true,mergedIndices,spawnedIndex);
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
      let bird=290,vy=0,pipes=[],score=0,started=false,dead=false,last=0,spawn=0,flight=0;
      help("Dotknij planszy lub naciśnij spację, aby podskoczyć.");
      function drawCity(){ 
        const grad=ctx.createLinearGradient(0,0,0,600);grad.addColorStop(0,"#65c9ff");grad.addColorStop(1,"#e0f7ff");ctx.fillStyle=grad;ctx.fillRect(0,0,420,600);
        // Słońce i delikatne chmury — jasny, dzienny klimat.
        ctx.fillStyle="#ffe879";ctx.beginPath();ctx.arc(350,76,31,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="rgba(255,255,255,.82)";
        for(let i=0;i<4;i++){const x=((i*137-flight*.18)%520+520)%520-50,y=90+(i%3)*54;ctx.beginPath();ctx.ellipse(x,y,28,10,0,0,Math.PI*2);ctx.ellipse(x+18,y-5,18,12,0,0,Math.PI*2);ctx.ellipse(x+32,y,23,9,0,0,Math.PI*2);ctx.fill();}
        // Panorama miasta przesuwa się delikatnie podczas lotu.
        for(let i=0;i<12;i++){const bw=30+(i*17%23),bh=72+(i*31%105),x=((i*57-flight*.28)%520+520)%520-45,y=535-bh;ctx.fillStyle=i%3===0?"#8ab8cf":i%3===1?"#a6c9d9":"#79a9c3";ctx.fillRect(x,y,bw,bh);ctx.fillStyle="rgba(255,244,174,.85)";for(let wy=y+13;wy<520;wy+=19){for(let wx=x+7;wx<x+bw-4;wx+=13)ctx.fillRect(wx,wy,5,7);}}
        // Ulica na dole planszy.
        ctx.fillStyle="#596b79";ctx.fillRect(0,540,420,60);ctx.fillStyle="#f8f4cf";for(let x=-40+(flight*.7%80);x<460;x+=80)ctx.fillRect(x,568,42,4);
        // Karetka jedzie po ulicy i porusza się wraz z postępem lotu.
        const ax=((flight*.75)%560)-100,ay=511,bob=Math.sin(flight*.035)*1.5;
        ctx.save();ctx.translate(ax,ay+bob);
        ctx.fillStyle="#f7fbff";ctx.fillRect(0,8,76,27);ctx.fillStyle="#d9e7f0";ctx.fillRect(7,2,45,12);ctx.fillStyle="#86d8ff";ctx.fillRect(12,4,13,9);ctx.fillRect(29,4,17,9);
        ctx.fillStyle="#e83e4b";ctx.fillRect(0,23,76,12);ctx.fillStyle="#fff";ctx.fillRect(33,12,8,16);ctx.fillRect(27,18,20,7);
        ctx.fillStyle="#ff3d4f";ctx.fillRect(26,0,12,4);ctx.fillStyle="#4385ff";ctx.fillRect(39,0,12,4);
        ctx.fillStyle="#253746";ctx.beginPath();ctx.arc(17,36,7,0,Math.PI*2);ctx.arc(59,36,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#b8c9d5";ctx.beginPath();ctx.arc(17,36,3,0,Math.PI*2);ctx.arc(59,36,3,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      function draw(){drawCity();pipes.forEach(p=>{ctx.fillStyle="#75cf53";ctx.fillRect(p.x,0,58,p.top);ctx.fillRect(p.x,p.top+150,58,600-p.top-150);ctx.fillStyle="#b7ff4a";ctx.fillRect(p.x-4,p.top-15,66,15);ctx.fillRect(p.x-4,p.top+150,66,15);});ctx.fillStyle="#ffd166";ctx.beginPath();ctx.arc(100,bird,14,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(105,bird-4,4,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ff9f43";ctx.beginPath();ctx.moveTo(112,bird+1);ctx.lineTo(128,bird+6);ctx.lineTo(112,bird+10);ctx.fill();ctx.font="bold 30px ui-monospace,monospace";ctx.textAlign="center";ctx.fillStyle="#fff";ctx.fillText(score,210,50);if(!started||dead){ctx.fillStyle="rgba(0,0,0,.6)";ctx.fillRect(30,245,360,100);ctx.fillStyle="#b7ff4a";ctx.font="bold 18px ui-monospace,monospace";ctx.fillText(dead?"KONIEC GRY":"GOTOWY?",210,282);ctx.font="12px ui-monospace,monospace";ctx.fillStyle="#fff";ctx.fillText(dead?"Dotknij, aby spróbować ponownie":"Dotknij / spacja = lot",210,311);}}
      function fresh(){bird=290;vy=0;pipes=[];score=0;started=false;dead=false;last=0;spawn=0;flight=0;say("Dotknij, aby wystartować");draw();}
      function flap(){if(dead){fresh();started=true;}if(!started){started=true;say("Leć!");}vy=-390;}
      function tick(t){if(destroyed)return;const dt=Math.min(.03,(t-(last||t))/1000);last=t;if(started&&!dead){vy+=1080*dt;bird+=vy*dt;spawn+=dt;flight+=165*dt;if(spawn>1.45){spawn=0;pipes.push({x:440,top:70+Math.random()*270,passed:false});}pipes.forEach(p=>{p.x-=165*dt;if(!p.passed&&p.x+58<100){p.passed=true;score++;say("Punkty: "+score);}if(100+14>p.x&&100-14<p.x+58&&(bird-14<p.top||bird+14>p.top+150))dead=true;});pipes=pipes.filter(p=>p.x>-70);if(bird>586||bird<0)dead=true;if(dead)say("Koniec. Wynik: "+score);}draw();raf=requestAnimationFrame(tick);}
      const kd=e=>{if(e.code==="Space"||e.code==="ArrowUp"){if(!root.hidden){e.preventDefault();flap();}}};on(window,"keydown",kd,true);on(canvas,"pointerdown",e=>{e.preventDefault();flap();});on(reset,"click",fresh);fresh();raf=requestAnimationFrame(tick);
    }



    function marioGame(){
      const canvas=make("canvas","arcade-canvas mario-canvas");
      canvas.width=800;canvas.height=450;canvas.tabIndex=0;canvas.setAttribute("aria-label","Mario Adventure — poziom 1-1");
      put(canvas);
      const ctx=canvas.getContext("2d");
      const controls=make("div","mario-touch-controls");
      const movePad=make("div","mario-move-controls");
      const actionPad=make("div","mario-action-controls");
      const leftBtn=button("◀","mario-control mario-left");
      const rightBtn=button("▶","mario-control mario-right");
      const jumpBtn=button("⬆","mario-control mario-jump");
      const runBtn=button("⚡","mario-control mario-run");
      leftBtn.setAttribute("aria-label","Idź w lewo");rightBtn.setAttribute("aria-label","Idź w prawo");
      jumpBtn.setAttribute("aria-label","Skacz");runBtn.setAttribute("aria-label","Biegnij szybciej");
      movePad.append(leftBtn,rightBtn);actionPad.append(jumpBtn,runBtn);controls.append(movePad,actionPad);put(controls);
      const W=800,H=450,groundY=390,world=5900,gravity=1420;
      let player={x:60,y:352,w:27,h:38,vx:0,vy:0,onGround:false,facing:1,big:false,invulnerable:0};
      let camera=0,coins=[],enemies=[],mushrooms=[],score=0,coinCount=0,lives=3,ended=false,won=false,last=0,rafId=0,elapsed=0;
      const keys=new Set(),solids=[],ground=[];
      const gaps=[[1700,1810],[3180,3290],[4370,4470]];
      const coinLine=[210,252,294,560,602,644,850,892,934,1200,1242,1284,1510,1552,1594,1930,1972,2014,2290,2332,2374,2690,2732,2774,3040,3082,3124,3440,3482,3524,3860,3902,3944,4200,4242,4284,4630,4672,4714,4960,5002,5044,5250,5292,5334];
      function addSolid(x,y,w,h,type,extra){const s={x,y,w,h,type,...(extra||{})};solids.push(s);return s;}
      let start=0;
      gaps.forEach(g=>{if(g[0]>start){ground.push({x:start,w:g[0]-start});addSolid(start,groundY,g[0]-start,H-groundY,"ground");}start=g[1];});
      ground.push({x:start,w:world-start});addSolid(start,groundY,world-start,H-groundY,"ground");
      function row(x,count,y,type){for(let i=0;i<count;i++)addSolid(x+i*32,y,32,32,type||"brick");}
      function question(x,y,reward){addSolid(x,y,32,32,"question",{reward:reward||"coin"});}
      // Układ poziomu inspirowany klasycznymi platformówkami 8-bit.
      question(320,292,"coin");row(384,3,292,"brick");question(416,292,"coin");row(512,2,228,"brick");question(544,228,"mushroom");
      row(800,3,292,"brick");question(832,292,"coin");question(960,260,"coin");row(1120,4,292,"brick");question(1152,292,"coin");
      addSolid(650,groundY-55,64,55,"pipe");addSolid(1370,groundY-82,64,82,"pipe");
      question(1512,258,"coin");row(1544,3,258,"brick");question(1608,258,"coin");
      question(1944,292,"mushroom");row(1976,3,292,"brick");row(2104,3,228,"brick");question(2136,228,"coin");
      addSolid(2440,groundY-62,64,62,"pipe");question(2656,292,"coin");row(2688,4,292,"brick");
      row(2848,3,244,"brick");question(2880,244,"coin");addSolid(3000,groundY-96,64,96,"pipe");
      question(3400,260,"mushroom");row(3432,4,260,"brick");question(3560,292,"coin");
      addSolid(3790,groundY-78,64,78,"pipe");row(3984,3,292,"brick");question(4016,292,"coin");
      row(4144,3,228,"brick");question(4176,228,"coin");addSolid(4620,groundY-56,64,56,"pipe");
      row(4824,4,292,"brick");question(4856,292,"coin");question(5000,258,"coin");row(5032,3,258,"brick");
      row(5200,3,292,"brick");question(5232,292,"coin");
      // Klasyczne schodki prowadzące do flagi.
      row(5384,1,358,"brick");row(5416,2,326,"brick");row(5448,3,294,"brick");row(5480,4,262,"brick");
      function seed(){
        coins=coinLine.map((x,i)=>({x,y:((i%5===0)?246:(i%3===0)?285:330),taken:false,fly:false}));
        enemies=[
          {x:520,min:470,max:625,w:28,h:26,dir:-1,alive:true},
          {x:900,min:850,max:1010,w:28,h:26,dir:1,alive:true},
          {x:1050,min:1000,max:1190,w:28,h:26,dir:-1,alive:true},
          {x:1460,min:1420,max:1640,w:28,h:26,dir:1,alive:true},
          {x:1900,min:1850,max:2070,w:28,h:26,dir:1,alive:true},
          {x:2350,min:2260,max:2490,w:28,h:26,dir:-1,alive:true},
          {x:2780,min:2700,max:2950,w:28,h:26,dir:1,alive:true},
          {x:3360,min:3320,max:3570,w:28,h:26,dir:-1,alive:true},
          {x:3900,min:3820,max:4070,w:28,h:26,dir:1,alive:true},
          {x:4690,min:4500,max:4780,w:28,h:26,dir:-1,alive:true},
          {x:5070,min:5000,max:5170,w:28,h:26,dir:1,alive:true}
        ];
        mushrooms=[];
      }
      function fresh(){
        player={x:60,y:groundY-38,w:27,h:38,vx:0,vy:0,onGround:true,facing:1,big:false,invulnerable:0};
        camera=0;score=0;coinCount=0;lives=3;ended=false;won=false;last=0;elapsed=0;keys.clear();seed();
        say("Poziom 1-1 • powodzenia!");draw(0);
        if(rafId)cancelAnimationFrame(rafId);rafId=requestAnimationFrame(tick);
      }
      function addFloatingCoin(x,y){coins.push({x,y,baseY:y,taken:false,fly:true,vy:-390,age:0});}
      function jump(){
        if(ended)return;
        if(player.onGround){player.vy=-560;player.onGround=false;player.jumpHold=0;}
      }
      function loseLife(){
        if(player.invulnerable>0||ended)return;
        if(player.big){player.big=false;player.h=38;player.y+=10;player.invulnerable=1.25;say("Super Mario stracił moc!");return;}
        lives--;player.invulnerable=1.5;player.vx=-player.facing*130;player.vy=-280;
        if(lives<=0){ended=true;won=false;say("Koniec gry • wybierz OD NOWA");}
        else say("Uważaj! Pozostało żyć: "+lives);
      }
      function bump(s){
        if(s.type==="question"){
          const reward=s.reward;s.type="used";score+=200;
          if(reward==="mushroom")mushrooms.push({x:s.x+3,y:s.y-25,w:26,h:25,vx:80,vy:-180,age:0});
          else addFloatingCoin(s.x+16,s.y-8);
          say(reward==="mushroom"?"Grzybek! Złap go!":"+200 punktów • moneta!");
        }else if(s.type==="brick"&&player.big){
          s.broken=true;score+=50;s.type="broken";
        }
      }
      function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
      function moveAndCollide(dt){
        const oldX=player.x,oldY=player.y,oldBottom=oldY+player.h;
        const left=keys.has("ArrowLeft")||keys.has("KeyA"),right=keys.has("ArrowRight")||keys.has("KeyD");
        const running=keys.has("ShiftLeft")||keys.has("ShiftRight")||keys.has("ControlLeft")||keys.has("ControlRight");
        const target=(right?1:0)-(left?1:0);
        if(target){player.facing=target;player.vx+=target*(running?1500:1250)*dt;player.vx=Math.max(-(running?310:225),Math.min(running?310:225,player.vx));}
        else {player.vx*=Math.pow(.0008,dt);if(Math.abs(player.vx)<7)player.vx=0;}
        player.x=Math.max(0,Math.min(world-player.w,player.x+player.vx*dt));
        for(const s of solids){
          if(s.type==="broken")continue;
          if(player.y+player.h>s.y+3&&player.y<s.y+s.h-3&&player.x+player.w>s.x&&player.x<s.x+s.w){
            if(player.vx>0&&oldX+player.w<=s.x+Math.abs(player.vx*dt)+1){player.x=s.x-player.w;player.vx=0;}
            else if(player.vx<0&&oldX>=s.x+s.w-Math.abs(player.vx*dt)-1){player.x=s.x+s.w;player.vx=0;}
          }
        }
        const wasOnGround=player.onGround;
        player.vy=Math.min(880,player.vy+gravity*dt);
        if(player.vy<0&&(keys.has("Space")||keys.has("ArrowUp")||keys.has("KeyW"))&&(player.jumpHold||0)<.22){
          player.vy-=gravity*.52*dt;player.jumpHold=(player.jumpHold||0)+dt;
        }
        player.y+=player.vy*dt;player.onGround=false;
        for(const s of solids){
          if(s.type==="broken")continue;
          if(player.x+player.w<=s.x+2||player.x>=s.x+s.w-2)continue;
          const bottom=player.y+player.h;
          if(player.vy>=0&&oldBottom<=s.y+7&&bottom>=s.y){
            player.y=s.y-player.h;player.vy=0;player.onGround=true;
          }else if(player.vy<0&&oldY>=s.y+s.h-5&&player.y<=s.y+s.h){
            player.y=s.y+s.h;player.vy=0;
            if(s.type==="question"||s.type==="brick")bump(s);
          }
        }
        if(player.onGround&&!wasOnGround)player.jumpHold=0;
        if(player.y>H+100){lives--;if(lives<=0){ended=true;won=false;say("Wpadłeś! Koniec gry.");}else{player.x=Math.max(50,player.x-190);player.y=groundY-100;player.vx=0;player.vy=0;say("Uważaj na przepaście! Życia: "+lives);}}
      }
      function update(dt){
        elapsed+=dt;
        if(player.invulnerable>0)player.invulnerable=Math.max(0,player.invulnerable-dt);
        const oldBottom=player.y+player.h;
        const wasFalling=player.vy>0;
        moveAndCollide(dt);
        for(const c of coins){
          if(c.taken)continue;
          if(c.fly){c.age+=dt;c.y+=c.vy*dt;c.vy+=gravity*dt;if(c.age>.55){c.taken=true;score+=100;coinCount++;}}
          else if(Math.abs(player.x+player.w/2-c.x)<22&&Math.abs(player.y+player.h/2-c.y)<28){c.taken=true;score+=100;coinCount++;say("Monety: "+coinCount);}
        }
        for(const e of enemies){
          if(!e.alive)continue;
          e.x+=e.dir*66*dt;if(e.x<e.min){e.x=e.min;e.dir=1;}if(e.x>e.max){e.x=e.max;e.dir=-1;}
          const support=solids.filter(s=>s.type==="ground"&&e.x+e.w>s.x&&e.x<s.x+s.w).find(s=>s.y>=groundY);
          e.y=(support?support.y:groundY)-e.h;
          if(overlap(player,e)){
            if(wasFalling&&oldBottom<=e.y+17&&player.y+player.h>=e.y-2){e.alive=false;player.vy=-370;player.onGround=false;score+=200;say("+200 • świetny skok!");}
            else if(player.invulnerable<=0)loseLife();
          }
        }
        for(const m of mushrooms){
          if(m.gone)continue;m.age+=dt;m.vy=Math.min(700,m.vy+gravity*dt);m.x+=m.vx*dt;m.y+=m.vy*dt;
          for(const s of solids){if(s.type==="broken")continue;if(m.x+m.w>s.x&&m.x<s.x+s.w&&m.y+m.h>s.y&&m.y+m.h-m.vy*dt<=s.y&&m.vy>=0){m.y=s.y-m.h;m.vy=0;}}
          if(m.x<0||m.x>world-m.w)m.vx*=-1;
          if(overlap(player,m)){m.gone=true;score+=1000;player.big=true;const bottom=player.y+player.h;player.h=48;player.y=bottom-player.h;say("SUPER MARIO! +1000");}
        }
        if(player.x>5660){ended=true;won=true;score+=1000;say("Poziom ukończony! +1000");}
        camera=Math.max(0,Math.min(world-W,player.x-270));
      }
      function drawCloud(x,y,scale){
        ctx.fillStyle="#fff";ctx.fillRect(x+12*scale,y+10*scale,48*scale,17*scale);
        ctx.fillRect(x+20*scale,y,20*scale,20*scale);ctx.fillRect(x+39*scale,y+5*scale,19*scale,18*scale);
        ctx.fillStyle="#d7efff";ctx.fillRect(x+18*scale,y+22*scale,38*scale,4*scale);
      }
      function drawBackground(){
        ctx.fillStyle="#5c94fc";ctx.fillRect(0,0,W,H);
        ctx.fillStyle="#ffd35a";ctx.beginPath();ctx.arc(680,86,28,0,Math.PI*2);ctx.fill();
        const shift=camera*.24;
        for(let i=0;i<10;i++){let x=((i*210-shift)%(W+250)+W+250)%(W+250)-90;drawCloud(x,56+(i%3)*42,1+(i%2)*.16);}
        for(let i=0;i<9;i++){let x=i*280-camera*.42;while(x< -320)x+=2520;while(x<W+60){ctx.fillStyle="#64bd62";ctx.beginPath();ctx.moveTo(x,groundY);ctx.quadraticCurveTo(x+75,groundY-125,x+160,groundY);ctx.fill();ctx.fillStyle="#8be08a";ctx.fillRect(x+82,groundY-52,17,5);x+=2520;}}
      }
      function drawGround(s){
        ctx.fillStyle="#c77936";ctx.fillRect(s.x,s.y,s.w,s.h);ctx.fillStyle="#65bd45";ctx.fillRect(s.x,s.y,s.w,9);ctx.fillStyle="#b2e95d";ctx.fillRect(s.x,s.y,s.w,3);
        for(let x=s.x;x<s.x+s.w;x+=32){ctx.strokeStyle="#8a4a23";ctx.lineWidth=2;ctx.strokeRect(x,s.y+10,32,25);ctx.beginPath();ctx.moveTo(x,s.y+23);ctx.lineTo(x+32,s.y+23);ctx.moveTo(x+16,s.y+10);ctx.lineTo(x+16,s.y+23);ctx.stroke();}
      }
      function drawBlock(s){
        if(s.type==="broken")return;
        if(s.type==="pipe"){
          ctx.fillStyle="#087d19";ctx.fillRect(s.x,s.y+6,s.w,s.h-6);ctx.fillStyle="#14b82a";ctx.fillRect(s.x+7,s.y+9,12,s.h-9);ctx.fillStyle="#087d19";ctx.fillRect(s.x-5,s.y,s.w+10,15);ctx.fillStyle="#24d53b";ctx.fillRect(s.x+1,s.y+2,s.w-2,9);ctx.fillStyle="#075c17";ctx.fillRect(s.x+s.w-7,s.y+12,4,s.h-12);return;
        }
        if(s.type==="question"||s.type==="used"){
          ctx.fillStyle=s.type==="used"?"#ad6a3e":"#ffbf37";ctx.fillRect(s.x,s.y,32,32);ctx.fillStyle=s.type==="used"?"#81502e":"#fff078";ctx.fillRect(s.x+3,s.y+3,26,26);ctx.strokeStyle="#944b22";ctx.lineWidth=2;ctx.strokeRect(s.x+1,s.y+1,30,30);
          ctx.fillStyle=s.type==="used"?"#85532e":"#b15a1d";ctx.font="bold 24px monospace";ctx.textAlign="center";ctx.fillText(s.type==="used"?"·":"?",s.x+16,s.y+25);ctx.textAlign="left";return;
        }
        if(s.type==="brick"){
          ctx.fillStyle="#b95025";ctx.fillRect(s.x,s.y,32,32);ctx.strokeStyle="#6d2b19";ctx.lineWidth=2;ctx.strokeRect(s.x+1,s.y+1,30,30);ctx.beginPath();ctx.moveTo(s.x,s.y+16);ctx.lineTo(s.x+32,s.y+16);ctx.moveTo(s.x+16,s.y);ctx.lineTo(s.x+16,s.y+16);ctx.moveTo(s.x+8,s.y+16);ctx.lineTo(s.x+8,s.y+32);ctx.moveTo(s.x+25,s.y+16);ctx.lineTo(s.x+25,s.y+32);ctx.stroke();ctx.fillStyle="#e97b39";ctx.fillRect(s.x+3,s.y+3,10,3);return;
        }
      }
      function drawCoin(c,t){
        if(c.taken)return;const width=c.fly?6:Math.max(3,Math.abs(Math.sin(t/150))*10);
        ctx.fillStyle="#f8a51c";ctx.beginPath();ctx.ellipse(c.x,c.y,width,12,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff079";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(c.x,c.y,width*.45,8,0,0,Math.PI*2);ctx.stroke();
      }
      function drawGoomba(e,t){
        if(!e.alive)return;ctx.fillStyle="#7b361c";ctx.fillRect(e.x+3,e.y+8,e.w-6,e.h-9);ctx.fillStyle="#a9572a";ctx.beginPath();ctx.ellipse(e.x+e.w/2,e.y+12,e.w/2,12,0,Math.PI,Math.PI*2);ctx.fill();
        ctx.fillStyle="#fff";ctx.fillRect(e.x+5,e.y+12,6,7);ctx.fillRect(e.x+17,e.y+12,6,7);ctx.fillStyle="#1b1522";ctx.fillRect(e.x+7,e.y+15,3,4);ctx.fillRect(e.x+19,e.y+15,3,4);ctx.fillStyle="#562416";ctx.fillRect(e.x+2,e.y+e.h-5,10,5);ctx.fillRect(e.x+17,e.y+e.h-5,10,5);
      }
      function drawMushroom(m){
        if(m.gone)return;ctx.fillStyle="#ffdfbd";ctx.fillRect(m.x+5,m.y+10,16,15);ctx.fillStyle="#f44845";ctx.beginPath();ctx.ellipse(m.x+13,m.y+10,13,10,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.fillRect(m.x+5,m.y+3,5,5);ctx.fillRect(m.x+15,m.y,5,5);ctx.fillStyle="#241a1a";ctx.fillRect(m.x+8,m.y+13,3,4);ctx.fillRect(m.x+17,m.y+13,3,4);
      }
      function drawHero(t){
        if(player.invulnerable>0&&Math.floor(t/90)%2===0)return;
        const x=Math.round(player.x),y=Math.round(player.y),h=player.h,leg=(Math.floor(t/90)%2)&&Math.abs(player.vx)>20;
        // Autorski, pikselowy bohater: czerwona czapka, niebieski kombinezon i brązowe buty.
        ctx.fillStyle="#b9271d";ctx.fillRect(x+3,y+2,player.w-5,7);ctx.fillRect(x,y+7,player.w,5);
        ctx.fillStyle="#f2b27b";ctx.fillRect(x+5,y+11,player.w-10,10);ctx.fillStyle="#5b2b18";ctx.fillRect(x+(player.facing>0?15:7),y+16,3,4);ctx.fillRect(x+5,y+21,player.w-10,3);
        ctx.fillStyle="#1760cf";ctx.fillRect(x+4,y+24,player.w-8,h-29);ctx.fillStyle="#f5ce3a";ctx.fillRect(x+7,y+25,3,4);ctx.fillRect(x+player.w-10,y+25,3,4);
        ctx.fillStyle="#e6a56f";ctx.fillRect(x,y+23,5,9);ctx.fillRect(x+player.w-5,y+23,5,9);
        ctx.fillStyle="#67351d";ctx.fillRect(x+2,y+h-6,10,6);ctx.fillRect(x+player.w-12+(leg?4:0),y+h-6,11,6);
        if(player.big){ctx.fillStyle="#fff";ctx.fillRect(x+4,y+8,player.w-8,2);}
      }
      function draw(t){
        drawBackground();ctx.save();ctx.translate(-Math.floor(camera),0);
        for(const s of solids){if(s.type==="ground")drawGround(s);else drawBlock(s);}
        // Dodatkowe dekoracyjne chmurki i krzaki na pierwszym planie.
        for(let x=120;x<world;x+=520){ctx.fillStyle="#168d35";ctx.beginPath();ctx.ellipse(x,groundY-7,34,20,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(x-34,groundY-7,68,7);ctx.fillStyle="#54d45e";ctx.fillRect(x-15,groundY-20,4,4);ctx.fillRect(x+9,groundY-15,4,4);}
        coins.forEach(c=>drawCoin(c,t));mushrooms.forEach(drawMushroom);enemies.forEach(e=>drawGoomba(e,t));
        drawHero(t);
        ctx.fillStyle="#fff";ctx.fillRect(5570,220,6,170);ctx.fillStyle="#e92b39";ctx.beginPath();ctx.moveTo(5576,226);ctx.lineTo(5626,240);ctx.lineTo(5576,254);ctx.closePath();ctx.fill();ctx.fillStyle="#dfdfdf";ctx.fillRect(5565,386,16,4);
        // Mały zamek za metą.
        ctx.fillStyle="#e9c9a0";ctx.fillRect(5705,330,80,60);ctx.fillRect(5712,313,17,17);ctx.fillRect(5758,313,17,17);ctx.fillStyle="#8e563a";ctx.fillRect(5736,358,18,32);ctx.fillStyle="#b15a39";ctx.fillRect(5720,342,8,8);ctx.fillRect(5760,342,8,8);
        ctx.restore();
        ctx.fillStyle="#fff";ctx.font="bold 14px monospace";ctx.textAlign="left";ctx.fillText("MARIO",22,22);ctx.fillText(String(score).padStart(6,"0"),22,40);ctx.fillText("● ×"+String(coinCount).padStart(2,"0"),185,22);ctx.fillText("WORLD",360,22);ctx.fillText("1-1",375,40);ctx.fillText("TIME",655,22);ctx.fillText(String(Math.max(0,300-Math.floor(elapsed))).padStart(3,"0"),665,40);ctx.fillText("♥ "+lives,720,40);
        if(ended){ctx.fillStyle="rgba(8,18,44,.82)";ctx.fillRect(125,145,550,145);ctx.textAlign="center";ctx.fillStyle=won?"#ffe45c":"#fff";ctx.font="bold 30px monospace";ctx.fillText(won?"POZIOM UKOŃCZONY!":"KONIEC GRY",400,196);ctx.fillStyle="#fff";ctx.font="bold 16px monospace";ctx.fillText("Wynik: "+score+"   Monety: "+coinCount,400,229);ctx.font="13px monospace";ctx.fillText("Naciśnij OD NOWA, aby zagrać ponownie",400,258);ctx.textAlign="left";}
      }
      function tick(t){
        if(destroyed)return;const dt=Math.min(.032,(t-(last||t))/1000||.016);last=t;
        if(!ended)update(dt);draw(t);
        rafId=requestAnimationFrame(tick);
      }
      const keyDown=e=>{
        if(!root.hidden&&["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space","KeyA","KeyD","KeyW","ShiftLeft","ShiftRight","ControlLeft","ControlRight"].includes(e.code)){
          e.preventDefault();
          const was=keys.has(e.code);keys.add(e.code);
          if(!was&&["ArrowUp","Space","KeyW"].includes(e.code))jump();
        }
      };
      const keyUp=e=>keys.delete(e.code);
      on(window,"keydown",keyDown,true);on(window,"keyup",keyUp,true);
      function hold(btn,code,doJump){
        const down=e=>{e.preventDefault();if(btn.setPointerCapture&&e.pointerId!==undefined){try{btn.setPointerCapture(e.pointerId);}catch(_){}}btn.classList.add("is-pressed");if(doJump){keys.add(code);jump();}else keys.add(code);};
        const up=e=>{if(e)e.preventDefault();keys.delete(code);btn.classList.remove("is-pressed");};
        on(btn,"pointerdown",down);on(btn,"pointerup",up);on(btn,"pointercancel",up);on(btn,"lostpointercapture",up);on(btn,"contextmenu",e=>e.preventDefault());
      }
      hold(leftBtn,"ArrowLeft",false);hold(rightBtn,"ArrowRight",false);hold(jumpBtn,"Space",true);
      hold(runBtn,"ShiftLeft",false);
      on(canvas,"pointerdown",e=>{canvas.focus();if(e.pointerType==="mouse"&&e.button===0){if(e.clientY<canvas.getBoundingClientRect().top+canvas.clientHeight*.55)jump();}});
      on(reset,"click",fresh);cleanup.push(()=>{cancelAnimationFrame(rafId);keys.clear();});
      help("← / → lub A / D — ruch • przytrzymaj ↑ / W / SPACJĘ, aby skoczyć wyżej • SHIFT / ⚡ — bieg");
      fresh();
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
      // Dotyk obsługujemy natywnie, bo na telefonach przeciąganie ma działać
      // przez cały gest, a nie tylko w miejscu pierwszego dotknięcia.
      let activeTouchId=null;
      function startDrag(e){
        if(!garage.hidden)return;
        if(e.cancelable)e.preventDefault();
        canvas.focus({preventScroll:true});
        if(!started||ended)beginRun();
        pointerDown=true;
        if(e.pointerId!==undefined){try{canvas.setPointerCapture(e.pointerId);}catch{}}
        steerToPointer(e);
      }
      function moveDrag(e){
        if(!pointerDown||!garage.hidden)return;
        if(e.cancelable)e.preventDefault();
        steerToPointer(e);
      }
      function stopDrag(e){
        pointerDown=false;
        try{if(e&&e.pointerId!==undefined&&canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}catch{}
      }
      // Pointer Events obsługują mysz. Dotyk ma osobną ścieżkę Touch Events,
      // ponieważ na iOS zdarzenia pointer potrafią zakończyć gest jak zwykłe kliknięcie.
      on(canvas,"pointerdown",e=>{if(e.pointerType==="touch"||e.pointerType==="pen")return;startDrag(e);},{passive:false});
      on(canvas,"pointermove",e=>{if(e.pointerType==="touch"||e.pointerType==="pen")return;moveDrag(e);},{passive:false});
      on(canvas,"pointerup",e=>{if(e.pointerType!=="touch"&&e.pointerType!=="pen")stopDrag(e);});
      on(canvas,"pointercancel",e=>{if(e.pointerType!=="touch"&&e.pointerType!=="pen")stopDrag(e);});
      on(window,"pointerup",e=>{if(e.pointerType!=="touch"&&e.pointerType!=="pen")stopDrag(e);});
      function findActiveTouch(list){
        for(let i=0;i<list.length;i++)if(list[i].identifier===activeTouchId)return list[i];
        return null;
      }
      function touchStart(e){
        if(!garage.hidden||activeTouchId!==null)return;
        if(e.cancelable)e.preventDefault();
        const t=e.changedTouches[0];if(!t)return;
        activeTouchId=t.identifier;
        canvas.focus({preventScroll:true});
        if(!started||ended)beginRun();
        pointerDown=true;
        steerToPointer(t);
      }
      function touchMove(e){
        if(activeTouchId===null||!pointerDown||!garage.hidden)return;
        const t=findActiveTouch(e.touches);if(!t)return;
        if(e.cancelable)e.preventDefault();
        steerToPointer(t);
      }
      function touchEnd(e){
        if(activeTouchId===null)return;
        if(!findActiveTouch(e.changedTouches))return;
        if(e.cancelable)e.preventDefault();
        activeTouchId=null;pointerDown=false;
      }
      on(canvas,"touchstart",touchStart,{passive:false});
      on(window,"touchmove",touchMove,{passive:false});
      on(window,"touchend",touchEnd,{passive:false});
      on(window,"touchcancel",touchEnd,{passive:false});
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
      let ship=360,shots=[],aliens=[],enemyShots=[],score=0,lives=3,dir=1,step=0,ended=false,keys=new Set(),last=0,fire=0,lastPlayerShot=0;
      function formation(){aliens=[];for(let r=0;r<4;r++)for(let c=0;c<9;c++)aliens.push({x:100+c*58,y:65+r*48,alive:true,row:r});}
      function fresh(){ship=360;shots=[];enemyShots=[];score=0;lives=3;dir=1;step=0;ended=false;last=0;fire=0;lastPlayerShot=0;keys.clear();formation();say("← → / A D • SPACJA = strzał (odstęp 300 ms)");draw();}
      function playerShoot(){const now=performance.now();if(ended||now-lastPlayerShot<300)return;lastPlayerShot=now;shots.push({x:ship,y:438});}
      function draw(){const g=ctx.createLinearGradient(0,0,0,500);g.addColorStop(0,"#090c24");g.addColorStop(1,"#03070d");ctx.fillStyle=g;ctx.fillRect(0,0,720,500);for(let i=0;i<90;i++){ctx.fillStyle="rgba(255,255,255,.5)";ctx.fillRect((i*83)%720,(i*47)%500,2,2);}ctx.strokeStyle="rgba(0,234,255,.15)";ctx.beginPath();ctx.moveTo(0,465);ctx.lineTo(720,465);ctx.stroke();aliens.forEach((a,i)=>{if(!a.alive)return;ctx.fillStyle=["#b7ff4a","#4ee9ff","#ff5da2","#b18cff"][a.row];ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;ctx.fillRect(a.x,a.y,29,18);ctx.fillRect(a.x+5,a.y-5,5,5);ctx.fillRect(a.x+19,a.y-5,5,5);ctx.fillRect(a.x+5,a.y+17,5,5);ctx.fillRect(a.x+19,a.y+17,5,5);ctx.shadowBlur=0;ctx.fillStyle="#071018";ctx.fillRect(a.x+6,a.y+5,4,4);ctx.fillRect(a.x+19,a.y+5,4,4);});ctx.fillStyle="#f5f7ff";shots.forEach(s=>ctx.fillRect(s.x-2,s.y-9,4,12));ctx.fillStyle="#ff5da2";enemyShots.forEach(s=>ctx.fillRect(s.x-3,s.y,6,12));ctx.fillStyle="#00eaff";ctx.shadowColor="#00eaff";ctx.shadowBlur=16;ctx.beginPath();ctx.moveTo(ship,440);ctx.lineTo(ship-23,470);ctx.lineTo(ship+23,470);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="#fff";ctx.font="bold 15px ui-monospace,monospace";ctx.fillText("WYNIK "+score+"    ŻYCIA "+lives,16,25);if(ended||!aliens.some(a=>a.alive)){ctx.fillStyle="rgba(0,0,0,.7)";ctx.fillRect(150,205,420,100);ctx.textAlign="center";ctx.fillStyle="#00eaff";ctx.font="bold 24px ui-monospace,monospace";ctx.fillText(aliens.some(a=>a.alive)?"KONIEC GRY":"SEKTOR OCZYSZCZONY",360,245);ctx.fillStyle="#fff";ctx.font="13px ui-monospace,monospace";ctx.fillText("Wynik: "+score+" • kliknij OD NOWA",360,274);ctx.textAlign="left";}}
      function tick(t){if(destroyed)return;const dt=Math.min(.04,(t-(last||t))/1000);last=t;if(!ended){if(keys.has("ArrowLeft")||keys.has("KeyA"))ship=Math.max(28,ship-300*dt);if(keys.has("ArrowRight")||keys.has("KeyD"))ship=Math.min(692,ship+300*dt);shots.forEach(s=>s.y-=440*dt);enemyShots.forEach(s=>s.y+=200*dt);shots=shots.filter(s=>s.y>-20);enemyShots=enemyShots.filter(s=>s.y<520);step+=dt;const alive=aliens.filter(a=>a.alive);if(step>.48){step=0;let edge=false;alive.forEach(a=>{a.x+=dir*13;if(a.x<8||a.x>683)edge=true;});if(edge){dir*=-1;alive.forEach(a=>a.y+=13);}}fire+=dt;if(fire>Math.max(.35,1.1-alive.length*.01)){fire=0;if(alive.length){const a=alive[Math.floor(Math.random()*alive.length)];enemyShots.push({x:a.x+14,y:a.y+20});}}shots.forEach(s=>{const a=aliens.find(a=>a.alive&&s.x>a.x-4&&s.x<a.x+33&&s.y>a.y-6&&s.y<a.y+26);if(a){a.alive=false;s.y=-50;score+=10;}});enemyShots.forEach(s=>{if(Math.abs(s.x-ship)<23&&s.y>438&&s.y<472){s.y=550;lives--;if(lives<=0)ended=true;}});if(!aliens.some(a=>a.alive)){ended=true;say("Sektor oczyszczony!");}if(alive.some(a=>a.y>415))ended=true;}draw();raf=requestAnimationFrame(tick);}
      const kd=e=>{if(["ArrowLeft","ArrowRight","KeyA","KeyD","Space"].includes(e.code)){e.preventDefault();keys.add(e.code);if(e.code==="Space")playerShoot();}},ku=e=>keys.delete(e.code);on(window,"keydown",kd,true);on(window,"keyup",ku,true);on(canvas,"pointermove",e=>{const r=canvas.getBoundingClientRect();ship=Math.max(28,Math.min(692,(e.clientX-r.left)*720/r.width));});on(canvas,"pointerdown",()=>{if(ended){fresh();return;}playerShoot();});on(reset,"click",fresh);fresh();raf=requestAnimationFrame(tick);
    }


    function tacticalGame(){
      // TACTICAL STRIKE: własny raycaster 2.5D — prawdziwa pętla gry, a nie plansza-obraz.
      const canvas=make("canvas","arcade-canvas tactical-canvas");
      const W=800,H=500,FOV=Math.PI/2.9;
      canvas.width=W;canvas.height=H;canvas.tabIndex=0;
      canvas.setAttribute("aria-label","TACTICAL STRIKE — kliknij planszę, by sterować myszą");
      put(canvas);
      const ctx=canvas.getContext("2d");
      if(window.matchMedia("(pointer: coarse)").matches){
        canvas.hidden=true;
        const note=make("div","tactical-pc-only");
        note.innerHTML="<strong>TACTICAL STRIKE — TYLKO PC</strong><p>Ta strzelanka wymaga klawiatury i myszy. Otwórz ją na komputerze.</p>";
        put(note);say("Gra dostępna tylko na PC");
        help("WASD — ruch • mysz — obrót widoku • LPM — strzał • R — przeładowanie.");
        return;
      }
      const fullscreenButton=button("⛶ PEŁNY EKRAN","snake-btn snake-small tactical-fullscreen");
      tools.insertBefore(fullscreenButton,reset);
      on(fullscreenButton,"click",()=>{
        if(document.fullscreenElement){
          if(document.exitFullscreen)document.exitFullscreen().catch(()=>say("Nie udało się wyjść z pełnego ekranu"));
          return;
        }
        if(!canvas.requestFullscreen){say("Przeglądarka nie obsługuje pełnego ekranu");return;}
        canvas.requestFullscreen().then(()=>canvas.focus()).catch(()=>say("Nie udało się uruchomić pełnego ekranu"));
      });
      on(document,"fullscreenchange",()=>{
        fullscreenButton.textContent=document.fullscreenElement===canvas?"⤢ WYJDŹ Z PEŁNEGO EKRANU":"⛶ PEŁNY EKRAN";
        if(document.fullscreenElement===canvas)canvas.focus();
      });

      const map=[
        "1111111111111111",
        "1000000000000001",
        "1001100001100001",
        "1000000100000001",
        "1010000100000101",
        "1000000000000001",
        "1000110000110001",
        "1000000000000001",
        "1000001100000001",
        "1000000000000001",
        "1011000000001101",
        "1000000100000001",
        "1000000100000001",
        "1000000000000001",
        "1000000000000001",
        "1111111111111111"
      ];
      const MW=map[0].length,MH=map.length;
      const isWall=(x,y)=>{
        const gx=Math.floor(x),gy=Math.floor(y);
        return gy<0||gy>=MH||gx<0||gx>=MW||map[gy][gx]==="1";
      };
      const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
      const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
      let player,bots,keys=new Set(),bullets=[],health,ammo,reserve,score,round;
      let reloading=false,reloadEnds=0,reloadTimer=null,ended=false,won=false,last=0,flashUntil=0,recoil=0,damageFlash=0,walkBob=0;
      let mouseDown=false,mouseLocked=false,lastShot=0,weaponSwayX=0,weaponSwayY=0;
      let lastSuccessfulFrameAt=performance.now(),lastFrameError="",lastInputMoveAt=performance.now();
      let zBuffer=new Float32Array(W);
      // Wybieraj boty z wielu otwartych pól mapy zamiast układać je w jednej linii.
      function findSpawnPoints(count){
        const candidates=[];
        for(let y=1;y<MH-1;y++)for(let x=1;x<MW-1;x++){
          const point={x:x+.5,y:y+.5};
          if(blocked(point.x,point.y,.2))continue;
          if(Math.hypot(point.x-player.x,point.y-player.y)<3.2)continue;
          candidates.push(point);
        }
        for(let i=candidates.length-1;i>0;i--){
          const j=Math.floor(Math.random()*(i+1));
          [candidates[i],candidates[j]]=[candidates[j],candidates[i]];
        }
        const chosen=[];
        for(const point of candidates){
          if(chosen.every(other=>Math.hypot(point.x-other.x,point.y-other.y)>=1.45)){
            chosen.push(point);
            if(chosen.length===count)break;
          }
        }
        // A densely packed map may not have enough well-separated cells; fill the
        // remainder with any other open cells rather than falling back to a line.
        if(chosen.length<count){
          for(const point of candidates){
            if(!chosen.some(other=>other.x===point.x&&other.y===point.y)){
              chosen.push(point);
              if(chosen.length===count)break;
            }
          }
        }
        return chosen;
      }
      function blocked(x,y,r){
        return isWall(x-r,y-r)||isWall(x+r,y-r)||isWall(x-r,y+r)||isWall(x+r,y+r);
      }
      function moveEntity(e,dx,dy,r){
        if(!blocked(e.x+dx,e.y,r))e.x+=dx;
        if(!blocked(e.x,e.y+dy,r))e.y+=dy;
      }
      function lineOfSight(x1,y1,x2,y2){
        const dx=x2-x1,dy=y2-y1,dist=Math.hypot(dx,dy),steps=Math.ceil(dist*14);
        for(let i=1;i<steps;i++){
          const p=i/steps;
          if(isWall(x1+dx*p,y1+dy*p))return false;
        }
        return true;
      }
      function castRay(rayAngle){
        const dx=Math.cos(rayAngle),dy=Math.sin(rayAngle);
        let gx=Math.floor(player.x),gy=Math.floor(player.y);
        const deltaX=Math.abs(1/(dx||1e-9)),deltaY=Math.abs(1/(dy||1e-9));
        const stepX=dx<0?-1:1,stepY=dy<0?-1:1;
        let sideX=(dx<0?player.x-gx:gx+1-player.x)*deltaX;
        let sideY=(dy<0?player.y-gy:gy+1-player.y)*deltaY;
        let side=0,dist=0,hit=false,steps=0;
        while(!hit&&steps++<64){
          if(sideX<sideY){sideX+=deltaX;gx+=stepX;side=0;}
          else{sideY+=deltaY;gy+=stepY;side=1;}
          if(gy<0||gy>=MH||gx<0||gx>=MW||map[gy][gx]==="1"){
            hit=true;dist=side===0?sideX-deltaX:sideY-deltaY;
          }
        }
        if(!hit)dist=20;
        return {distance:Math.max(.001,dist),side,gx,gy,dx,dy};
      }
      function resetGame(){
        player={x:2.5,y:7.5,angle:0};previousMouseX=null;
        keys.clear();bullets=[];health=100;ammo=12;reserve=72;score=0;round=1;
        if(reloadTimer){clearTimeout(reloadTimer);reloadTimer=null;}
        reloading=false;reloadEnds=0;ended=false;won=false;last=0;
        flashUntil=0;recoil=0;damageFlash=0;walkBob=0;mouseDown=false;lastShot=0;weaponSwayX=0;weaponSwayY=0;
        spawnBots(5);say("RUNDA 1 • 5 BOTÓW");draw();
      }
      function spawnBots(count){
        bots=findSpawnPoints(count).map(s=>({x:s.x,y:s.y,hp:100,alive:true,
          speed:.65+Math.random()*.22,fire:1+Math.random()*1.5,
          strafe:Math.random()<.5?-1:1,hit:0}));
      }
      function finishReload(){
        if(!reloading)return;
        const amount=Math.min(12-ammo,reserve);
        ammo+=amount;reserve-=amount;reloading=false;reloadEnds=0;
        say("Przeładowano.");
      }
      function reload(){
        if(ended||reloading)return;
        if(ammo===12){say("Magazynek pełny.");return;}
        if(reserve<=0){say("Brak amunicji w zapasie.");return;}
        reloading=true;reloadEnds=performance.now()+1050;say("Przeładowanie…");
        // Zakończ niezależnie od kolejnej klatki renderowania lub chwilowej utraty fokusu.
        reloadTimer=later(()=>{reloadTimer=null;finishReload();},1050);
      }
      let previousMouseX=null;
      function normalizeAngle(){player.angle=Math.atan2(Math.sin(player.angle),Math.cos(player.angle));}
      function rotateFromMouse(e){
        if(!player||e.buttons===2)return;
        // Jeden centralny handler obsługuje Pointer Lock i zwykłe ruchy myszy.
        if(document.pointerLockElement){
          const movement=Number(e.movementX||e.webkitMovementX||e.mozMovementX||0);
          player.angle+=movement*.0045;
          weaponSwayX=clamp(weaponSwayX+movement*.16,-22,22);weaponSwayY=clamp(weaponSwayY+Math.abs(movement)*.025,0,8);
          previousMouseX=null;
          normalizeAngle();
          if(performance.now()-lastSuccessfulFrameAt>120)safeDraw();
          return;
        }
        const rect=canvas.getBoundingClientRect();
        const inside=e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
        if(!inside){previousMouseX=null;return;}
        if(previousMouseX!==null){
          const delta=e.clientX-previousMouseX;
          if(Math.abs(delta)>0){player.angle+=clamp(delta,-80,80)*.012;weaponSwayX=clamp(weaponSwayX+delta*.16,-22,22);weaponSwayY=clamp(weaponSwayY+Math.abs(delta)*.025,0,8);}
          normalizeAngle();
        }
        previousMouseX=e.clientX;
        if(performance.now()-lastSuccessfulFrameAt>120)safeDraw();
      }
      function shoot(){
        if(ended||reloading)return;
        if(ammo<=0){reload();return;}
        const now=performance.now();
        if(now-lastShot<170)return;
        lastShot=now;ammo--;recoil=1;flashUntil=now+70;
        const wallDistance=castRay(player.angle).distance;
        let target=null,best=wallDistance+.05;
        bots.forEach(b=>{
          if(!b.alive)return;
          const dx=b.x-player.x,dy=b.y-player.y;
          const dist=Math.hypot(dx,dy);
          const forward=dx*Math.cos(player.angle)+dy*Math.sin(player.angle);
          const lateral=Math.abs(-dx*Math.sin(player.angle)+dy*Math.cos(player.angle));
          if(forward>0&&lateral<.30&&forward<best&&dist<wallDistance+.35){
            if(lineOfSight(player.x,player.y,b.x,b.y)){target=b;best=forward;}
          }
        });
        if(target){target.hp-=34;target.hit=.16;if(target.hp<=0){target.alive=false;score++;say("Trafienie! Eliminacje: "+score);}}
      }
      function drawWorld(t){
        const sky=ctx.createLinearGradient(0,0,0,H*.53);
        sky.addColorStop(0,"#101b29");sky.addColorStop(1,"#60737b");
        ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*.52);
        const floor=ctx.createLinearGradient(0,H*.48,0,H);
        floor.addColorStop(0,"#525e60");floor.addColorStop(.45,"#343d40");floor.addColorStop(1,"#141c22");
        ctx.fillStyle=floor;ctx.fillRect(0,H*.48,W,H*.52);
        const horizon=H*.5+Math.sin(walkBob)*2;
        ctx.strokeStyle="rgba(220,239,237,.08)";ctx.lineWidth=1;
        for(let n=1;n<10;n++){
          const y=horizon+(n*n)*1.7;
          if(y<H){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
        }
        for(let x=0;x<W;x+=2){
          const cameraX=2*x/W-1;
          const rayAngle=player.angle+Math.atan(cameraX*Math.tan(FOV/2));
          const ray=castRay(rayAngle);
          const perp=Math.max(.08,ray.distance*Math.cos(rayAngle-player.angle));
          zBuffer[x]=perp;zBuffer[x+1]=perp;
          const wallH=Math.min(H*3,H/perp);
          const top=Math.max(0,(H-wallH)/2),bottom=Math.min(H,(H+wallH)/2);
          const wallFraction=ray.side===0?player.y+ray.distance*ray.dy:player.x+ray.distance*ray.dx;
          const brickLine=(Math.floor(wallFraction*7)%7===0);
          let shade=clamp(1-perp/13,.24,.96)*(ray.side===1?.76:1);
          if(brickLine)shade*=.72;
          const r=Math.round(88*shade),g=Math.round(112*shade),b=Math.round(117*shade);
          ctx.fillStyle="rgb("+r+","+g+","+b+")";
          ctx.fillRect(x,top,2,bottom-top);
          if(perp<6&&wallH>50){
            ctx.fillStyle="rgba(220,241,236,"+(0.055*shade)+")";
            ctx.fillRect(x,top,1,wallH*.12);
          }
        }
      }
      function drawBots(){
        const sorted=bots.filter(b=>b.alive).map(b=>{
          const dx=b.x-player.x,dy=b.y-player.y,dist=Math.hypot(dx,dy);
          const rel=angleDiff(Math.atan2(dy,dx),player.angle);return {...b,dist,rel,depth:dist*Math.cos(rel)};
        }).sort((a,b)=>b.depth-a.depth);
        sorted.forEach(b=>{
          if(Math.abs(b.rel)>FOV*.75||b.dist<.2)return;
          const sx=W/2+(Math.tan(b.rel)/Math.tan(FOV/2))*(W/2);
          const size=clamp(H/Math.max(.2,b.depth)*.76,12,H*1.8);
          const sw=size*.38,sh=size*.78,feet=H*.51+size*.12;
          const left=Math.round(sx-sw/2),top=feet-sh;
          const centre=clamp(Math.round(sx),0,W-1);
          if(b.depth>zBuffer[centre]+.15)return;
          ctx.fillStyle="rgba(0,0,0,.35)";
          ctx.beginPath();ctx.ellipse(sx,feet,sw*.7,size*.09,0,0,Math.PI*2);ctx.fill();
          // Nogi, kamizelka, głowa i broń — sprite jest rysowany i animowany w każdej klatce.
          ctx.fillStyle="#20262c";ctx.fillRect(left+sw*.14,feet-sh*.26,sw*.25,sh*.28);
          ctx.fillRect(left+sw*.57,feet-sh*.26,sw*.25,sh*.28);
          ctx.fillStyle=b.hit>0?"#fff":"#8d3438";
          ctx.fillRect(left+sw*.06,top+sh*.36,sw*.88,sh*.42);
          ctx.fillStyle="#303b43";ctx.fillRect(left+sw*.18,top+sh*.39,sw*.64,sh*.22);
          ctx.fillStyle="#d6b49a";ctx.fillRect(sx-sw*.22,top+sh*.08,sw*.44,sh*.27);
          ctx.fillStyle="#20272d";ctx.fillRect(sx-sw*.28,top+sh*.055,sw*.56,sh*.11);
          ctx.fillStyle="#111820";ctx.fillRect(left+sw*.57,top+sh*.44,sw*.74,sh*.07);
          ctx.fillStyle="#090f12";ctx.fillRect(sx-sw*.6,top-7,sw*1.2,4);
          ctx.fillStyle="#ff5b58";ctx.fillRect(sx-sw*.6,top-7,sw*1.2*Math.max(0,b.hp/100),4);
        });
      }
      function drawWeapon(t){
        const now=performance.now();
        const kick=recoil*16,bob=Math.sin(walkBob)*3;
        const reloadProgress=reloading?clamp(1-(reloadEnds-now)/1050,0,1):0;
        const reloadDrop=Math.sin(reloadProgress*Math.PI)*72;
        const reloadTilt=Math.sin(reloadProgress*Math.PI)*.16;
        weaponSwayX*=.82;weaponSwayY*=.82;
        const weaponX=W*.60+weaponSwayX,weaponY=H*.79+bob+weaponSwayY+kick+reloadDrop;
        ctx.save();ctx.translate(weaponX,weaponY);ctx.rotate(reloadTilt);
        // Viewmodel w stylu CS: niżej, bliżej środka i z widocznymi rękami.
        ctx.fillStyle="#26323a";ctx.beginPath();ctx.moveTo(-100,-18);ctx.lineTo(-62,-45);ctx.lineTo(-28,-40);ctx.lineTo(-10,-9);ctx.lineTo(-95,-3);ctx.closePath();ctx.fill();
        ctx.fillStyle="#ba8e73";ctx.beginPath();ctx.moveTo(-68,-12);ctx.lineTo(-42,-58);ctx.lineTo(-14,-50);ctx.lineTo(10,-9);ctx.closePath();ctx.fill();
        ctx.fillStyle="#131a20";ctx.fillRect(-12,-64,125,35);
        ctx.fillStyle="#3b4c55";ctx.fillRect(-6,-60,95,21);
        ctx.fillStyle="#111820";ctx.fillRect(60,-54,93,8);
        ctx.fillStyle="#66777e";ctx.fillRect(93,-52,52,3);
        ctx.fillStyle="#111820";ctx.fillRect(5,-74,44,11);
        ctx.fillStyle="#2c3c43";ctx.fillRect(10,-70,29,4);
        ctx.fillStyle="#121a20";ctx.fillRect(7,-34,25,21);
        ctx.fillStyle="#69777b";ctx.fillRect(-1,-31,11,3);
        ctx.fillStyle="#b9876a";ctx.fillRect(24,-28,38,15);
        ctx.restore();
        if(now<flashUntil){
          ctx.save();ctx.translate(weaponX+145,weaponY-48);
          ctx.fillStyle="#fff5c4";ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(19,-8);ctx.lineTo(13,0);ctx.lineTo(24,8);ctx.lineTo(4,7);ctx.closePath();ctx.fill();
          ctx.fillStyle="#ffb04f";ctx.beginPath();ctx.arc(3,0,8,0,Math.PI*2);ctx.fill();ctx.restore();
        }
        recoil=Math.max(0,recoil-.12);
      }
      function drawHud(){
        ctx.fillStyle="rgba(5,12,16,.86)";ctx.fillRect(16,16,183,61);
        ctx.strokeStyle="rgba(95,218,195,.55)";ctx.strokeRect(16,16,183,61);
        ctx.fillStyle="#98afb4";ctx.font="800 10px ui-monospace,monospace";ctx.fillText("OPERATOR // CT",27,31);
        ctx.fillStyle="#e7f6f4";ctx.font="900 20px ui-monospace,monospace";ctx.fillText("HP "+String(health).padStart(3,"0"),27,55);
        ctx.fillStyle="#203437";ctx.fillRect(27,62,156,6);
        ctx.fillStyle=health>35?"#54e0bc":"#ff5b63";ctx.fillRect(27,62,156*health/100,6);
        ctx.fillStyle="rgba(5,12,16,.86)";ctx.fillRect(W-178,16,162,61);
        ctx.strokeStyle="rgba(95,218,195,.55)";ctx.strokeRect(W-178,16,162,61);
        ctx.fillStyle="#98afb4";ctx.font="800 10px ui-monospace,monospace";ctx.fillText("RIFLE // 5.56",W-166,31);
        ctx.fillStyle="#e7f6f4";ctx.font="900 22px ui-monospace,monospace";ctx.fillText(String(ammo).padStart(2,"0")+" / "+String(reserve).padStart(2,"0"),W-166,57);
        ctx.textAlign="center";ctx.fillStyle="#ddf7f0";ctx.font="800 11px ui-monospace,monospace";
        ctx.fillText("RUNDA "+round+"   •   ELIMINACJE "+score+"   •   BOTY "+bots.filter(b=>b.alive).length,W/2,26);
        ctx.strokeStyle="#d5fff5";ctx.lineWidth=2;ctx.beginPath();
        ctx.moveTo(W/2-12,H/2);ctx.lineTo(W/2-4,H/2);
        ctx.moveTo(W/2+4,H/2);ctx.lineTo(W/2+12,H/2);
        ctx.moveTo(W/2,H/2-12);ctx.lineTo(W/2,H/2-4);
        ctx.moveTo(W/2,H/2+4);ctx.lineTo(W/2,H/2+12);ctx.stroke();
        ctx.fillStyle="#d5fff5";ctx.fillRect(W/2-1,H/2-1,2,2);
        ctx.textAlign="left";
        if(!mouseLocked&&!ended){
          ctx.fillStyle="rgba(5,12,16,.8)";ctx.fillRect(W/2-180,H-37,360,22);
          ctx.fillStyle="#bce7de";ctx.font="800 10px ui-monospace,monospace";
          ctx.textAlign="center";ctx.fillText("KLIKNIJ PLANSZĘ, ABY AKTYWOWAĆ MYSZ",W/2,H-22);ctx.textAlign="left";
        }
        if(reloading){
          ctx.fillStyle="rgba(6,13,17,.8)";ctx.fillRect(W/2-65,H-72,130,24);
          ctx.fillStyle="#fff0b0";ctx.textAlign="center";ctx.font="900 12px ui-monospace,monospace";
          ctx.fillText("PRZEŁADOWANIE",W/2,H-56);ctx.textAlign="left";
        }
      }
      function draw(){
        drawWorld(performance.now());drawBots();drawWeapon(performance.now());drawHud();
        if(damageFlash>0){ctx.fillStyle="rgba(255,38,53,"+(damageFlash*.22)+")";ctx.fillRect(0,0,W,H);}
        if(ended){
          ctx.fillStyle="rgba(2,7,10,.78)";ctx.fillRect(0,0,W,H);
          ctx.textAlign="center";ctx.fillStyle=won?"#7affd9":"#ff6c72";
          ctx.font="900 34px ui-monospace,monospace";ctx.fillText(won?"SEKTOR OCZYSZCZONY":"OPERATOR DOWN",W/2,H/2-16);
          ctx.fillStyle="#e7f6f4";ctx.font="800 15px ui-monospace,monospace";
          ctx.fillText("Eliminacje: "+score+" • kliknij OD NOWA",W/2,H/2+20);ctx.textAlign="left";
        }
      }
      function safeDraw(){
        try{draw();}catch(error){say("BŁĄD RYSOWANIA: "+String(error&&error.message||error).slice(0,70));}
      }
      function tick(t){
        if(destroyed)return;
        try{
        const dt=Math.min(.035,(t-(last||t))/1000);last=t;
        if(!ended){
          if(mouseDown)shoot();
          bullets.forEach(b=>{b.life-=dt;});
          bullets=bullets.filter(b=>b.life>0);

          bots.forEach(b=>{
            if(!b.alive)return;
            b.hit=Math.max(0,b.hit-dt);
            const dx=player.x-b.x,dy=player.y-b.y,dist=Math.hypot(dx,dy);
            const a=Math.atan2(dy,dx);
            if(dist>2.1){
              const vx=Math.cos(a)*b.speed*dt,vy=Math.sin(a)*b.speed*dt;
              if(!blocked(b.x+vx,b.y,.18))b.x+=vx;
              if(!blocked(b.x,b.y+vy,.18))b.y+=vy;
            }else{
              const side=a+Math.PI/2*b.strafe;
              const vx=Math.cos(side)*b.speed*.55*dt,vy=Math.sin(side)*b.speed*.55*dt;
              if(!blocked(b.x+vx,b.y,.18))b.x+=vx;
              if(!blocked(b.x,b.y+vy,.18))b.y+=vy;
            }
            b.fire-=dt;
            if(dist<7&&b.fire<=0&&lineOfSight(player.x,player.y,b.x,b.y)){
              b.fire=1.1+Math.random()*.7;health-=8;damageFlash=.6;
              if(health<=0){health=0;ended=true;won=false;say("Koniec rundy — naciśnij OD NOWA.");}
            }
          });
          if(!bots.some(b=>b.alive)){
            if(round>=3){ended=true;won=true;say("Wygrana! Sektor oczyszczony.");}
            else{round++;health=Math.min(100,health+25);ammo=12;reserve=Math.min(120,reserve+24);spawnBots(5+round);say("RUNDA "+round+" • "+(5+round)+" BOTÓW");}
          }
          damageFlash=Math.max(0,damageFlash-dt);
        }
        draw();
        lastSuccessfulFrameAt=performance.now();lastFrameError="";
        }catch(error){
          const message=String(error&&error.message||error);
          if(message!==lastFrameError){lastFrameError=message;say("BŁĄD PĘTLI GRY: "+message.slice(0,75));}
        }
        raf=requestAnimationFrame(t);
      }
      const getCode=e=>{
        if(["KeyW","KeyA","KeyS","KeyD","KeyR"].includes(e.code))return e.code;
        const m={w:"KeyW",a:"KeyA",s:"KeyS",d:"KeyD",r:"KeyR"};
        return typeof e.key==="string"?m[e.key.toLowerCase()]||null:null;
      };
      const keydown=e=>{
        const code=getCode(e);if(!code)return;
        e.preventDefault();e.stopImmediatePropagation();keys.add(code);
        if(code==="KeyR"&&!e.repeat)reload();
      };
      const keyup=e=>{
        const code=getCode(e);if(!code)return;
        e.preventDefault();e.stopImmediatePropagation();keys.delete(code);
      };
      const pointerdown=e=>{
        if(e.button!==0)return;
        e.preventDefault();
        previousMouseX=e.clientX;
        canvas.focus();
        if(!document.pointerLockElement){
          try{
            const request=canvas.requestPointerLock;
            if(typeof request==="function"){
              const result=request.call(canvas);
              if(result&&typeof result.catch==="function")result.catch(()=>{mouseLocked=false;say("Mysz działa bez blokady — przesuwaj ją nad planszą.");});
            }
          }catch{mouseLocked=false;say("Mysz działa bez blokady — przesuwaj ją nad planszą.");}
        }
        mouseDown=true;
        if(ended){resetGame();return;}
        shoot();
      };
      const pointerup=e=>{if(e.button===0)mouseDown=false;};
      // Słuchaj na dokumencie, aby R działało także po otwarciu panelu overlayu
      // i po utracie fokusu przez canvas; canvas jest dodatkowym fallbackiem.
      on(document,"keydown",keydown,true);on(document,"keyup",keyup,true);
      on(canvas,"keydown",keydown);on(canvas,"keyup",keyup);
      // Niezależny ruch gracza działa także wtedy, gdy animacja klatkowa zgłosi błąd.
      every(()=>{
        if(!player)return;
        const now=performance.now(),dt=Math.min(.04,Math.max(0,(now-lastInputMoveAt)/1000));
        lastInputMoveAt=now;
        const forward=(keys.has("KeyW")?1:0)-(keys.has("KeyS")?1:0);
        const strafe=(keys.has("KeyD")?1:0)-(keys.has("KeyA")?1:0);
        if(!ended&&(forward||strafe)){
          const mag=Math.hypot(forward,strafe)||1;
          const speed=2.5*dt;
          const dx=(Math.cos(player.angle)*forward+Math.cos(player.angle+Math.PI/2)*strafe)/mag*speed;
          const dy=(Math.sin(player.angle)*forward+Math.sin(player.angle+Math.PI/2)*strafe)/mag*speed;
          moveEntity(player,dx,dy,.19);walkBob+=dt*10;
        }
        // Watchdog redraws even if no movement key is held.
        if(performance.now()-lastSuccessfulFrameAt>120)safeDraw();
      },16);
      // Nasłuch w capture zapobiega utracie zdarzenia po drodze przez nakładki strony.
      on(document,"mousemove",rotateFromMouse,true);
      on(canvas,"mouseenter",e=>{previousMouseX=e.clientX;});
      on(canvas,"mouseleave",()=>{previousMouseX=null;});
      on(canvas,"pointerdown",pointerdown);on(window,"pointerup",pointerup);on(document,"pointerup",pointerup);
      on(canvas,"pointercancel",()=>{mouseDown=false;});on(document,"mouseup",()=>{mouseDown=false;});
      on(canvas,"contextmenu",e=>e.preventDefault());
      on(window,"blur",()=>{keys.clear();mouseDown=false;});
      on(document,"pointerlockchange",()=>{
        mouseLocked=document.pointerLockElement===canvas;
        previousMouseX=null;
        say(mouseLocked?"MYSZ AKTYWNA • WASD RUCH • LPM STRZAŁ":"Mysz odblokowana — ruszaj kursorem po planszy, aby obracać");
      });
      on(reset,"click",resetGame);
      resetGame();
      help("FPS 2.5D • kliknij planszę, aby aktywować mysz • WASD — ruch • mysz — obrót widoku • LPM — strzał • R — przeładowanie. Wyczyść 3 rundy botów.");
      raf=requestAnimationFrame(tick);
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
      else if(key==="tactical")tacticalGame();
    }
    init();
    return {destroy(){if(destroyed)return;destroyed=true;if(raf)cancelAnimationFrame(raf);timers.forEach(clearTimeout);intervals.forEach(clearInterval);cleanup.forEach(fn=>{try{fn();}catch{}});try{if(audio)audio.close();}catch{}root.replaceChildren();root.classList.remove("arcade-root");}};
  };
})();