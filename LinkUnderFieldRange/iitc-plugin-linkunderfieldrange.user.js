// ==UserScript==
// @author         fisher01
// @name           IITC plugin: Link under field range
// @category       Layer
// @version        1.1.1
// @description    Displays the 500m radius around each selected portals for linking under fields. Ranges can be removed using the "Clear Link Under Field" link in the IITC toolbox under portal details.
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
  plugin_info.dateTimeVersion = '20220408.115935';
  plugin_info.pluginId = 'LinkUnderFieldRange';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.linkunderfieldrange = function() {};
  window.plugin.linkunderfieldrange.layerlist = {};
  window.plugin.linkunderfieldrange.circleslist = [];

  window.plugin.linkunderfieldrange.update = function() {
    if (!window.map.hasLayer(window.plugin.linkunderfieldrange.linkunderfieldrangeLayers)) {
      return;
    }

    if (window.map.hasLayer(window.plugin.linkunderfieldrange.linkunderfieldrangeLayers)) {
      var p = window.portals[window.selectedPortal];
      if (p) {
        window.plugin.linkunderfieldrange.draw(p);
      }
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

  var clearlinkunderfieldrange = function() {
    window.plugin.linkunderfieldrange.linkunderfieldrangeLayers.clearLayers();
    window.plugin.linkunderfieldrange.circleslist.length = 0;
  }

  // Define and add the linkunderfieldrange circles for a given portal
  window.plugin.linkunderfieldrange.draw = function(portal) {
    // Create a new location object for the portal
    var coo = portal._latlng;
    var latlng = new L.LatLng(coo.lat, coo.lng);

    // Specify the link range circle options
    var circleOptions = {radius:500, color:'orange', weight:3, fill:false, dashArray:'10', dashOffset:'0', clickable:false, interactive:true};

    // Create the circle object with specified options
    var circle = new L.Circle(latlng, circleOptions);

    var canAdd = true;
    $.each(window.plugin.linkunderfieldrange.circleslist, function(i, c) {
      if (c.getLatLng().equals(circle.getLatLng())) {
        canAdd = false;
      }
    });

    if (canAdd) {
      window.plugin.linkunderfieldrange.circleslist.push(circle);

      // Add the new circle to the linkunderfieldrange draw layer if not any at this latLng
      circle.addTo(window.plugin.linkunderfieldrange.linkunderfieldrangeLayers).on("click", circleClick);
      window.Render.prototype.bringPortalsToFront();
    }
  }

  var circleClick = function(e) {
    window.plugin.linkunderfieldrange.linkunderfieldrangeLayers.removeLayer(e.target);
    var i = window.plugin.linkunderfieldrange.circleslist.indexOf(e.target);
    if (i > -1) {
      window.plugin.linkunderfieldrange.circleslist.splice(i, 1);
    }
  }

  // Initialize the plugin and display linkunderfieldranges if at an appropriate zoom level
  var setup = function() {
    window.plugin.linkunderfieldrange.linkunderfieldrangeLayers = new L.LayerGroup();
    window.addLayerGroup('Link under field range', window.plugin.linkunderfieldrange.linkunderfieldrangeLayers, true);
    window.plugin.linkunderfieldrange.layerlist['Link under field range'] =  window.plugin.linkunderfieldrange.linkunderfieldrangeLayers;
    addHook('portalSelected', window.plugin.linkunderfieldrange.update);
    window.pluginCreateHook('displayedLayerUpdated');
    window.addHook('displayedLayerUpdated',  window.plugin.linkunderfieldrange.setSelected);
    window.updateDisplayedLayerGroup = window.updateDisplayedLayerGroupModified;

    // this adds the "Clear Link Under Field" link to the IITC toolbox using JQuery syntax
    // the .click(clearlinkunderfieldrange) instructs IITC to call the clearlinkunderfieldrange function (above) when the link is clicked
    $("<a>")
      .html("Clear Link Under Field Range")
      .attr("title", "Remove drawn ranges for linking under fields")
      .click(clearlinkunderfieldrange)
      .appendTo("#toolbox");
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