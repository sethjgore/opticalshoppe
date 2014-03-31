/*
 Copyright (c) 2014, Pixel & Tonic, Inc.
 @license   http://buildwithcraft.com/license Craft License Agreement
 @link      http://buildwithcraft.com
*/
TransformLoader=function(a,b,c,e){this.placeholderUrl=a;this.entityPlaceholderUrl=b;this.spinnerUrl=c;this.generateTransformUrl=e;a=new Image;a.onload=this.bind("init");a.src=c};
TransformLoader.prototype={bind:function(a,b){var c=this;return function(){c[a].apply(c,b)}},insertAfter:function(a,b){b.nextSibling?b.parentNode.insertBefore(a,b.nextSibling):b.parentNode.appendChild(a)},escapeForRegex:function(a){return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")},init:function(){this.escapedPlaceholderUrl=this.escapeForRegex(this.placeholderUrl);this.escapedEntityPlaceholderUrl=this.escapeForRegex(this.entityPlaceholderUrl);this.placeholderUrlPattern="(?:"+this.escapedPlaceholderUrl+
"|"+this.escapedEntityPlaceholderUrl+")#(\\d+)\\b";this.placeholderUrlRegex=RegExp(this.placeholderUrlPattern);this.multiPlaceholderUrlRegex=RegExp(this.placeholderUrlPattern,"g");this.transforms={};this.pendingTransforms=this.totalTransforms=0;var a=(document.head.innerHTML+document.body.innerHTML).match(this.multiPlaceholderUrlRegex);if(a)for(var b=0;b<a.length;b++){var c=a[b].match(this.placeholderUrlRegex),c=c[1];"undefined"==typeof this.transforms[c]&&(this.transforms[c]={imageTags:[],styleTags:[]},
this.totalTransforms++,this.pendingTransforms++)}if(this.totalTransforms){for(var a=document.getElementsByTagName("img"),e=document.getElementsByTagName("style"),d=a.length,g=e.length,b=0;b<d;b++)if(c=a[b].src.match(this.placeholderUrlRegex))this.transforms[c[1]].imageTags.push({tag:a[b],originalBgColor:a[b].style.backgroundColor,originalBgImage:a[b].style.backgroundImage,originalBgRepeat:a[b].style.backgroundRepeat,originalBgPosition:a[b].style.backgroundPosition,originalBgSize:a[b].style.backgroundSize}),
a[b].style.backgroundColor="#f5f5f5",a[b].style.backgroundImage="url("+this.spinnerUrl+")",a[b].style.backgroundRepeat="no-repeat",a[b].style.backgroundPosition="50% 50%",a[b].style.backgroundSize="48px";d=RegExp(this.placeholderUrlPattern+"[^}]*","g");for(b=0;b<g;b++)if((a=e[b].innerHTML.match(d))&&a.length){var h=document.createElement("style");h.setAttribute("type","text/css");for(var k=e[b].innerHTML,f=0;f<a.length;f++){var l=a[f]+" background: #f5f5f5 url("+this.spinnerUrl+") no-repeat 50% 50% !important; background-size: 48px !important",
k=k.replace(a[f],l),c=a[f].match(this.placeholderUrlRegex),c=c[1];this.transforms[c].styleTags.push({tag:e[b],tempTag:h,originalCss:a[f],tempCss:l})}h.innerHTML=k;this.insertAfter(h,e[b])}setTimeout(this.bind("makeGenerateTransformRequests"),500)}},makeGenerateTransformRequests:function(){for(var a in this.transforms)this.makeGenerateTransformRequest(a)},makeGenerateTransformRequest:function(a){var b=new XMLHttpRequest;b.onreadystatechange=this.getGenerateTransformResponseFunction(a,b);b.open("POST",
this.generateTransformUrl,!0);b.setRequestHeader("Content-type","application/x-www-form-urlencoded");b.setRequestHeader("X-Requested-With","XMLHttpRequest");b.send("transformId="+a)},getGenerateTransformResponseFunction:function(a,b){var c=this;return function(){c.onTransformResponse.call(c,a,b)}},onTransformResponse:function(a,b){if(4==b.readyState&&200==b.status){if("working"==b.responseText){var c=this;setTimeout(function(){c.makeGenerateTransformRequest(a)},1E3);return}if("success:"==b.responseText.substr(0,
8)){var e=b.responseText.substr(8),d=new Image;d.onload=this.bind("replaceTransformImages",[a,e]);d.src=e}}this.pendingTransforms--},replaceTransformImages:function(a,b){for(var c=RegExp(this.escapedPlaceholderUrl+"#"+a+"\\b","g"),e=0;e<this.transforms[a].imageTags.length;e++){var d=this.transforms[a].imageTags[e];d.tag.src=d.tag.src.replace(c,b);d.tag.style.backgroundColor=d.originalBgColor;d.tag.style.backgroundImage=d.originalBgImage;d.tag.style.backgroundRepeat=d.originalBgRepeat;d.tag.style.backgroundPosition=
d.originalBgPosition;d.tag.style.backgroundSize=d.originalBgSize}for(e=0;e<this.transforms[a].styleTags.length;e++){var d=this.transforms[a].styleTags[e],g=d.tempTag.innerHTML.replace(d.tempCss,d.originalCss),g=g.replace(c,b);d.tempTag.innerHTML=g}}};

//# sourceMappingURL=TransformLoader.min.map
