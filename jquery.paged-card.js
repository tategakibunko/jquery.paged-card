//  jquery.paged-card.js (version 0.1.0)
//  http://tategakibunko.github.io/jquery.paged-card.js
//  (c) 2014- Watanabe Masaki
//  license: MIT
;(function($){
  var Layout = Backbone.Model.extend({
    getTemplate : function(key){
      var source = this.get("template")[key] || "";
      return _.template(source);
    },
    getNehanLayout : function(){
      return _.pick(this.attributes, [
	"direction", "vert", "hori", "fontSize", "width", "height", "vertFontFamily", "horiFontFamily"
      ]);
    },
    getKey : function(){
      var layout = this.getNehanLayout();
      return _.map(_.pairs(layout), function(kv){
	return [kv[0], kv[1]].join(":");
      }).join("-");
    },
    getDocumentMode : function(){
      var direction = this.get("direction");
      return this.get(direction);
    },
    getCssClass : function(){
      return [
	this.get("direction"),
	this.getDocumentMode()
      ].join(" ");
    },
    getHeaderSize : function(){
      return {
	width:this.get("width") + this.get("marginLR"),
	height:this.get("headerHeight")
      };
    },
    getReaderSize : function(){
      return {
	width:this.get("width") + this.get("marginLR"),
	height:this.get("height") + this.get("marginTB") + this.get("headerHeight")
      };
    }
  });

  // wrap nehan stream.
  var PageStream = Backbone.Model.extend({
    defaults:{
      stream:null,
      progress:0
    },
    asyncGet : function(){
      var self = this;
      this.get("stream").asyncGet({
	onProgress : function(){
	  self.set("progress", self.get("progress") + 1); // -> change:progress
	}
      });
    },
    getPage : function(pos){
      return this.get("stream").get(pos);
    }
  });

  var Paging = Backbone.Model.extend({
    defaults:{
      pos:0,
      total:0
    },
    isValidPos : function(pos){
      return 0 <= pos && pos < this.get("total");
    },
    setPos : function(pos){
      if(this.get("pos") != pos && this.isValidPos(pos)){
	this.set("pos", pos); // -> change:pos
      }
    },
    incTotal : function(){
      this.set("total", this.get("total") + 1); // -> change:total
    },
    incPos : function(){
      var pos = this.get("pos");
      if(this.isValidPos(pos + 1)){
	this.set("pos", pos + 1); // -> change:pos
      }
    },
    decPos : function(){
      var pos = this.get("pos");
      if(this.isValidPos(pos - 1)){
	this.set("pos", pos - 1); // -> change:pos
      }
    }
  });

  var Title = Backbone.View.extend({
    className:"paged-card-title",
    render : function(){
      return this.$el.html(
	this.model.title
      );
    }
  });

  var Pager = Backbone.View.extend({
    className:"paged-card-pager",
    events:{
      "click .next":"onEventClickNext",
      "click .prev":"onEventClickPrev"
    },
    initialize : function(){
      this.$el.hide();
      this.template = this.model.layout.getTemplate("pager-" + this.model.layout.getDocumentMode());
      this.listenTo(this.model.paging, "change:total", this.onEventChangeTotal);
      this.listenTo(this.model.paging, "change:pos", this.onEventChangePos);
    },
    onEventClickNext : function(){
      this.model.paging.incPos();
      return false;
    },
    onEventClickPrev : function(){
      this.model.paging.decPos();
      return false;
    },
    onEventChangeTotal : function(){
      var total = this.model.paging.get("total");
      if(total === 1){
	this.$el.show();
      }
      this.$el.find(".total").html(total);
    },
    onEventChangePos : function(){
      var pos = this.model.paging.get("pos");
      this.$el.find(".pos").html(pos + 1);
    },
    render : function(){
      return this.$el.html(
	this.template(this.model.paging.toJSON())
      );
    }
  });

  var Header = Backbone.View.extend({
    className:"paged-card-header",
    render : function(){
      var size = this.model.layout.getHeaderSize();
      return this.$el.width(size.width).height(size.height).append(
	new Pager({model:this.model}).render()
      ).append(
	new Title({model:this.model}).render()
      );
    }
  });

  var Screen = Backbone.View.extend({
    className:"paged-card-screen",
    initialize : function(){
      this.listenTo(this.model.stream, "change:progress", this.onEventProgress);
      this.listenTo(this.model.paging, "change:pos", this.onEventPos);
    },
    onEventPos : function(){
      this.renderPage();
    },
    onEventProgress : function(){
      if(this.model.stream.get("progress") === 1){
	this.renderPage();
      }
      this.model.paging.incTotal();
    },
    renderPage : function(){
      var pos = this.model.paging.get("pos");
      var page = this.model.stream.getPage(pos);
      return this.$el.html(page.html);
    },
    renderStandby : function(){
      return this.$el
	.width(this.model.layout.get("width"))
	.height(this.model.layout.get("height"));
    }
  });

  var Reader = Backbone.View.extend({
    className:"paged-card-reader",
    render : function(){
      var size = this.model.layout.getReaderSize();
      return this.$el.width(size.width).height(size.height).append(
	new Header({model:this.model}).render()
      ).append(
	new Screen({model:this.model}).renderStandby()
      );
    }
  });

  // cache engines for each layout settings.
  var engines = {};

  $.fn.pagedCard = function(options){
    var elements = this;
    var opt = $.extend({}, $.fn.pagedCard.defaults, options);
    var get_engine = function(layout){
      var key = layout.getKey();
      if(engines[key]){
	return engines[key];
      }
      var engine = Nehan.setup({
	layout:layout.getNehanLayout()
      });
      engines[key] = engine; // cache
      return engine;
    };
    
    elements.each(function(){
      var $dom = $(this).css("display", "none");
      var text = $dom.html();
      var title = $dom.data("title") || "";

      var layout_args = {};
      _.each(_.pairs($.fn.pagedCard.defaults), function(kv){
	var key = kv[0], def_val = kv[1];
	if(typeof def_val !== "function"){
	  layout_args[key] = $dom.data(key) || def_val;
	} else {
	  layout_args[key] = $dom.data(key) || def_val($dom);
	}
      });

      var layout = new Layout(layout_args);
      var stream = new PageStream({
	stream:get_engine(layout).createPageStream(text)
      });
      var paging = new Paging();
      var reader = new Reader({
	model:{
	  title:title,
	  layout:layout,
	  stream:stream,
	  paging:paging
	}
      });

      $("<div />")
	.addClass("paged-card-reader-wrap")
	.addClass(layout.getCssClass())
	.insertAfter($dom)
	.append(reader.render());

      // start page layouting
      stream.asyncGet();

      return this;
    });
  }; // pagedCard

  // supported options
  $.fn.pagedCard.defaults = {

    // card title text displayed at header.
    title:"",

    // document direction. "hori" or "vert" enabled.
    direction:"hori",

    // document mode for direction "vert". "tb-rl" or "tb-lr" enabled.
    vert:"tb-rl",

    // document mode for direction "hori". only "lr-tb" is enabled.
    hori:"lr-tb",

    // basic font size in px format.
    fontSize:16,

    // text screen width. use parent width by default(offcource you can set integer directly).
    width:function($dom){
      return $dom.parent().width();
    },

    // text screen height
    height:400,

    // header(title and pager) size.
    headerHeight:30,

    // top-bottom margin size for text screen.
    marginTB:32,

    // left-right margin size for text screen.
    marginLR:32,

    // font-family for vertical format(direction = 'vert').
    vertFontFamily:"'ヒラギノ明朝 Pro W3','Hiragino Mincho Pro','HiraMinProN-W3','IPA明朝','IPA Mincho', 'Meiryo','メイリオ','ＭＳ 明朝','MS Mincho', monospace",

    // font-family for horizontal format(direction = 'hori').
    horiFontFamily:"'ヒラギノ明朝 Pro W3','Hiragino Mincho Pro','HiraMinProN-W3','IPA明朝','IPA Mincho', 'Meiryo','メイリオ','ＭＳ 明朝','MS Mincho', monospace",

    // template parts of ui. template syntax follows the rule of backbone.js.
    template:{

      // vertical pager(Japanese etc).
      "pager-tb-rl":[
	"<a href='#next' class='next button' title='next'><i class='fa fa-caret-square-o-left'></i></a>",
	"<span class='pos digit'><%= pos + 1 %></span> / <span class='total digit'><%= total %></span>",
	"<a href='#prev' class='prev button' title='prev'><i class='fa fa-caret-square-o-right'></i></a>"
      ].join(""),

      // vertical pager(Chinese etc).
      "pager-tb-lr":[
	"<a href='#prev' class='prev button' title='prev'><i class='fa fa-caret-square-o-left'></i></a>",
	"<span class='pos digit'><%= pos + 1 %></span> / <span class='total digit'><%= total %></span>",
	"<a href='#next' class='next button' title='next'><i class='fa fa-caret-square-o-right'></i></a>"
      ].join(""),

      // basical horizontal pager.
      "pager-lr-tb":[
	"<a href='#prev' class='prev button' title='prev'><i class='fa fa-caret-square-o-left'></i></a>",
	"<span class='pos digit'><%= pos + 1 %></span> / <span class='total digit'><%= total %></span>",
	"<a href='#next' class='next button' title='next'><i class='fa fa-caret-square-o-right'></i></a>"
      ].join("")
    }
  };
})(jQuery);


