	// http://paulbourke.net/miscellaneous/interpolation/
	
	// we use this to interpolate the ship towards the mouse position
	function lerp(start, end, amt){
		return start * (1-amt) + amt * end;
  }
  
  // we didn't use this one
  function cosineInterpolate(y1, y2, amt){
		let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
		return (y1 * (1 - amt2)) + (y2 * amt2);
  }
  
  // we use this to keep the ship on the screen
  function clamp(val, min, max){
	  return val < min ? min : (val > max ? max : val);
  }
  
  // bounding box collision detection - it compares PIXI.Rectangles
  function circlesIntersect(a, b){
	let aRadius = a.getBounds().width/2;
	let bRadius = b.getBounds().width/2;
	return bRadius + aRadius > distBetween(a,b);
  }

  function starColliding(s, startAngle, endAngle, b){
	if(circlesIntersect(s, b)){
		let relativePos = {x:(b.getBounds().x + b.getBounds().width/2) - (s.getBounds().x + s.getBounds().width/2), y:(b.getBounds().y + b.getBounds().height/2) - (s.getBounds().y + s.getBounds().height/2)};
		relativeAngle = Math.atan2(relativePos.y, relativePos.x);
		relativeAngle += Math.PI;
		if(relativeAngle < 0){
			relativeAngle += 2*Math.PI;
		}
		else if(relativeAngle > 2*Math.PI){
			relativeAngle -= 2*Math.PI;
		}
		if(relativeAngle < startAngle || relativeAngle > endAngle + Math.PI){
			return true;
		}
	}
	return false;
  }
  
  // these 2 helpers are used by classes.js
  function getRandomUnitVector(){
	  let x = getRandom(-1, 1);
	  let y = getRandom(-1, 1);
	  let length = Math.sqrt(x*x + y*y);
	  if(length == 0){ // very unlikely
		  x=1; // point right
		  y=0;
		  length = 1;
	  } else{
		  x /= length;
		  y /= length;
	  }
  
	  return {x:x, y:y};
  }

  function getRandom(min, max) {
	  return Math.random() * (max - min) + min;
  }

  function distBetween(a, b){
	  let x = Math.abs((b.getBounds().x + b.getBounds().width/2) - (a.getBounds().x + a.getBounds().width/2));
	  let y = Math.abs((b.getBounds().y + b.getBounds().height/2) - (a.getBounds().y + a.getBounds().height/2));

	  return Math.sqrt(x*x + y*y)
  }