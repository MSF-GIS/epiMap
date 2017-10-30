/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

window.app = {};
var app = window.app;


//
// Define rotate to north control.
//



/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} opt_options Control options.
 */
app.RotateNorthControl = function(opt_options) {

  var options = opt_options || {};

  var button = document.createElement('button');
  button.innerHTML = 'N';

  var this_ = this;
  var handleRotateNorth = function(e) {
    this_.getMap().getView().setRotation(0);
  };

  button.addEventListener('click', handleRotateNorth, false);
  button.addEventListener('touchstart', handleRotateNorth, false);

  var element = document.createElement('div');
  element.className = 'rotate-north ol-unselectable ol-control';
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

};
ol.inherits(app.RotateNorthControl, ol.control.Control);