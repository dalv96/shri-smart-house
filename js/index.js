function changeVolume(value) {
  document.getElementsByClassName('music__value')[0].innerHTML = value + '%';
}

window.onload = function () {

  const picture = document.getElementsByClassName('active__picture')[0];
  const zoom = document.getElementById('zoom');
  const bright = document.getElementById('bright');
  const scrollbar = document.getElementById('scrollbar');
  const html = document.getElementsByTagName('html')[0];

  picture.style.transform = "scale(1) translateX(0) translateY(0)";
  picture.style.opacity = 1;

  let eventList = [];
  let prevDiff = -1;
  let prevX = -1;
  let prevY = -1;
  let usedForScale = [];

  picture.addEventListener('pointerdown', (event) => {
    picture.setPointerCapture(event.pointerId);
    eventList.push(event);
    prevX = event.clientX;
    prevY = event.clientY;
    prevA = null;
  });

  picture.addEventListener('pointermove', (event) => {
    picture.setPointerCapture(event.pointerId);

    let transform = parseTransform(picture.style.transform);

    for (var i = 0; i < eventList.length; i++) {
      if (event.pointerId == eventList[i].pointerId) {
          eventList[i] = event;
      break;
      }
    }
    zoom.innerHTML = `${(transform.scale * 100).toFixed(0)}%`;

    maxScrollX = ((picture.offsetWidth * transform.scale) - picture.offsetWidth)/(transform.scale * 2);
    maxScrollY = ((picture.offsetHeight * transform.scale) - picture.offsetHeight)/(transform.scale * 2);

    if (eventList.length == 2) {
   
      let diffX = eventList[0].clientX - eventList[1].clientX;
      let diffY = eventList[0].clientY - eventList[1].clientY;

      let angle = Math.atan2(diffY, diffX);
      
      if (Math.abs(prevA - angle) > 0.02) {
        if (prevA - angle < 0) {
          picture.style.opacity = +picture.style.opacity + 0.03;
          if (picture.style.opacity > 1) picture.style.opacity = 1;
        }
        else {
          picture.style.opacity = +picture.style.opacity - 0.03;
          if (picture.style.opacity < 0) picture.style.opacity = 0;        
        }
        
        bright.innerHTML = `${(picture.style.opacity * 100).toFixed(0)}%`;
        
      } else {
        var curDiff = Math.sqrt(diffX*diffX + diffY*diffY);

        if (prevDiff > 0) {

          let pix = (+picture.offsetWidth-40)/transform.scale;
          let percent = (pix*100)/(+picture.offsetWidth-40);
          
          if (percent == 100) {
            scrollbar.style.visibility = 'hidden';
          } else scrollbar.style.visibility = 'visible';
          
          html.style.cssText = `--thumb-width: ${percent}%`;

          if (curDiff > prevDiff) {
            if (transform.scale + 0.05 < 5)
              picture.style.transform = `scale(${transform.scale + 0.05}) translateX(${transform.x}px) translateY(${transform.y}px)`;
          }
          if (curDiff < prevDiff) {
          
            if (transform.scale > 1) {
              if (transform.scale - 0.05 < 1) transform.scale = 1;
              else transform.scale -= 0.05;
            } 
        
            if (transform.x > maxScrollX) {
              transform.x -= (transform.x - maxScrollX);
            }
  
            if (transform.y > maxScrollY + 3) {
              transform.y -= (transform.y - maxScrollY);
            }
  
            if (transform.x < -maxScrollX + 3) {
              transform.x -= (maxScrollX + transform.x);
            }
  
            if (transform.y < -maxScrollY + 3) {
              transform.y -= (maxScrollY + transform.y);
            }
            picture.style.transform = `scale(${transform.scale}) translateX(${transform.x}px) translateY(${transform.y}px)`;  
          }
        }
   
        prevDiff = curDiff;
      }
      prevA = angle;
    }

    if (eventList.length == 1) {
      let diffX = (prevX - event.clientX)/transform.scale;
      let diffY = (prevY - event.clientY)/transform.scale;
      
      
      if (transform.x - diffX < maxScrollX && transform.x - diffX > -maxScrollX)
        transform.x = transform.x - diffX;

      if (transform.y - diffY < maxScrollY && transform.y - diffY > -maxScrollY)
        transform.y = transform.y - diffY;

      picture.style.transform = `scale(${transform.scale}) translateX(${transform.x}px) translateY(${transform.y}px)`        
      
      prevX = event.clientX;
      prevY = event.clientY;
    }

    let scroll = transform.x + maxScrollX;
      
    scrollbar.value = 100 - (scroll*100)/(maxScrollX*2);
  });

  picture.addEventListener('pointerup', (event) => {
    picture.setPointerCapture(event.pointerId);
    removeEvent(event);
  })
  
  function removeEvent(ev) {
    for (var i = 0; i < eventList.length; i++) {
      if (eventList[i].pointerId == ev.pointerId) {
        eventList.splice(i, 1);
        usedForScale.splice(usedForScale.indexOf(ev.pointerId), 1);
        break;
      }
    }
  }
}

function parseTransform(str) {
  let res = {};
  let scaleStart = str.indexOf("scale");
  res.scale = +str.slice(scaleStart + 6, str.indexOf(")", scaleStart));

  let xStart = str.indexOf("translateX");
  res.x = +str.slice(xStart + 11, str.indexOf(")", xStart) - 2);

  let yStart = str.indexOf("translateY");
  res.y = +str.slice(yStart + 11, str.indexOf(")", yStart) - 2);

  return res;
}