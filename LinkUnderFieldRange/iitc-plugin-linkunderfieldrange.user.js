// ==UserScript==
// @author         fisher01
// @name           IITC plugin: Link under field range
// @category       Layer
// @version        1.0.1
// @description    Displays the 500m raidus around portals for linking nuder fields
// @id             iitc-plugin-linkunderfieldrange
// @updateURL      https://github.com/SebastienForay/IITC-Plugins/raw/main/LinkUnderFieldRange/iitc-plugin-linkunderfieldrange.meta.js
// @downloadURL    https://github.com/SebastienForay/IITC-Plugins/raw/main/LinkUnderFieldRange/iitc-plugin-linkunderfieldrange.user.js
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

var L; // to prevent script errors on load
var $; // to prevent script errors on load
var map; // to prevent script errors on load

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
  plugin_info.buildName = 'iitc';
  plugin_info.dateTimeVersion = '20220407.183000';
  plugin_info.pluginId = 'LinkUnderFieldRange';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.linkunderfieldrange = function() {};
  window.plugin.linkunderfieldrange.layerlist = {};

  window.plugin.linkunderfieldrange.update = function() {
    if (!window.map.hasLayer(window.plugin.linkunderfieldrange.linkunderfieldrangeLayers)) {
      return;
    }

    if (window.map.hasLayer(window.plugin.linkunderfieldrange.linkunderfieldrangeLayers)) {
      window.plugin.linkunderfieldrange.linkunderfieldrangeLayers.clearLayers();

      $.each(window.portals, function(i, portal) {
       window.plugin.linkunderfieldrange.draw(portal);
      });

      window.plugin.linkunderfieldrange.urlMarker();
    }
  }

  window.plugin.linkunderfieldrange.setSelected = function(a) {
    if (a.display) {
      var selectedLayer = window.plugin.linkunderfieldrange.layerlist[a.name];
      if (selectedLayer !== undefined) {
        if (!window.map.hasLayer(selectedLayer)) {
          window.map.addLayer(selectedLayer);
        }
        if (window.map.hasLayer(selectedLayer)) {
          window.plugin.linkunderfieldrange.update();
        }
      }
    }
  }

  // Define and add the linkunderfieldrange circles for a given portal
  window.plugin.linkunderfieldrange.draw = function(portal) {
    // Create a new location object for the portal
    var coo = portal._latlng;
    var latlng = new L.LatLng(coo.lat, coo.lng);

    // Specify the no submit circle options
    var circleOptions = {color:'red', opacity:1, fillColor:'orange', fillOpacity:0.40, weight:1, clickable:false, interactive:false};
    var range = 500;

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, range, circleOptions);

    // Add the new circle to the linkunderfieldrange draw layer
    circle.addTo(window.plugin.linkunderfieldrange.linkunderfieldrangeLayers);
  }

 // Initialize the plugin and display linkunderfieldranges if at an appropriate zoom level
  var setup = function() {
    window.plugin.linkunderfieldrange.linkunderfieldrangeLayers = new L.LayerGroup();
    window.addLayerGroup('Link under field range', window.plugin.linkunderfieldrange.linkunderfieldrangeLayers, true);
    window.plugin.linkunderfieldrange.layerlist['Link under field range'] =  window.plugin.linkunderfieldrange.linkunderfieldrangeLayers;
    addHook('mapDataRefreshEnd', window.plugin.linkunderfieldrange.update);
    window.pluginCreateHook('displayedLayerUpdated');
    window.addHook('displayedLayerUpdated',  window.plugin.linkunderfieldrange.setSelected);
    window.updateDisplayedLayerGroup = window.updateDisplayedLayerGroupModified;
  }

  // Overload for IITC default in order to catch the manual select/deselect event and handle it properly
  // Update layerGroups display status to window.overlayStatus and localStorage 'ingress.intelmap.layergroupdisplayed'
  window.updateDisplayedLayerGroupModified = function(name, display) {
    overlayStatus[name] = display;
    localStorage['ingress.intelmap.layergroupdisplayed'] = JSON.stringify(overlayStatus);
    runHooks('displayedLayerUpdated', {name: name, display: display});
  }

// PLUGIN END //////////////////////////////////////////////////////////
setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
}
// wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);