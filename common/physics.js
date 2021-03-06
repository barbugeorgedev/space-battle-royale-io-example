const util = require('./util.js');
const Matter = require('matter-js');
let Vector = Matter.Vector, Body = Matter.Body;

exports.thrust = function (speed, body) {
  const magnitude = -speed
  const angle = body.angle + Math.PI / 2
  body.force[0] += magnitude * Math.cos(angle)
  // -1 to fix for pixi's inverted y-axis
  body.force[1] += magnitude * Math.sin(angle) * -1
}

exports.getForceToMoveForward = (rigidBody, goBackwards = false) =>{
    let originalAngle = rigidBody.angle;
    if(goBackwards){
       originalAngle = addRadWithAngleWrap(originalAngle, Math.PI)
    }

    const forceX =  -Math.cos(originalAngle  + Math.PI * 0.5); // X-component.
    const forceY =  Math.sin(originalAngle  + Math.PI * 0.5); // Y-component.
    return {x: forceX, y: forceY};
};


exports.zeroRotation = function (body) {
  body.angularVelocity = 0
}


exports.rotateLeft = function (speed, body) {
  body.angularVelocity = -speed
}


exports.rotateRight = function (speed, body) {
  body.angularVelocity = speed
}


exports.normalizeAngle = function (body) {
  body.angle = body.angle % (2 * Math.PI)
  if (body.angle < 0) body.angle += (2 * Math.PI)
  return body
}


// returns position [x, y] of body's nose based on its rotation angle
exports.nose = function (body) {
  var r = body.circleRadius
  let x = body.position.x;
  let y = body.position.y;
  var noseX = x + r * Math.cos(body.angle - Math.PI/2)
  // -1 to fix for pixi's inverted y-axis
  var noseY = y + r * Math.sin(body.angle - Math.PI/2) * -1
  return [noseX, noseY]
}

exports.subtractRadWithAngleWrap = function (start, subtract){
    let newAngleInRad = start - subtract;
    if(newAngleInRad < 0){
        //newAngleInRad is now the remainder
        newAngleInRad = (2 * Math.PI) - newAngleInRad;
    }
    return newAngleInRad;
}

const addRadWithAngleWrap = function (start, add){
    let newAngleInRad = start + add;
    if(newAngleInRad > (2 * Math.PI)){
        newAngleInRad = newAngleInRad - (2 * Math.PI);
    }
    return newAngleInRad;
}
exports.addRadWithAngleWrap = addRadWithAngleWrap