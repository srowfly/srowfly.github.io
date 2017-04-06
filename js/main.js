
var imgUrl = 'http://xxx/share_ico.png'; // 分享后展示的一张图片
                var lineLink = 'http://xxx'; // 点击分享后跳转的页面地址
                var descContent = "xx！"; // 分享后的描述信息
                var shareTitle = 'xx'; // 分享后的标题
                var appid = ''; // 应用id,如果有可以填，没有就留空

function shareFriend() {
                        WeixinJSBridge.invoke('sendAppMessage',{
                                "appid": appid,
                                "img_url": imgUrl,
                                "img_width": "200",
                                "img_height": "200",
                                "link": lineLink,
                                "desc": descContent,
                                "title": shareTitle
                        }, function(res) {
                                //_report('send_msg', res.err_msg); // 这是回调函数，必须注释掉
                        })
                }

// 当微信内置浏览器完成内部初始化后会触发WeixinJSBridgeReady事件。
document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
                        // 发送给好友
                        WeixinJSBridge.on('menu:share:appmessage', function(argv){
                                shareFriend();
                        });
                        // 分享到朋友圈
                        WeixinJSBridge.on('menu:share:timeline', function(argv){
                                shareTimeline();
                        });
                        // 分享到微博
                        WeixinJSBridge.on('menu:share:weibo', function(argv){
                                shareWeibo();
                        });
                }, false);

$(document).ready(function() {

  $('a.blog-button').click(function() {
    // If already in blog, return early without animate overlay panel again.
    if (location.hash && location.hash == "#blog") return;
    if ($('.panel-cover').hasClass('panel-cover--collapsed')) return;
    $('.main-post-list').removeClass('hidden');
    currentWidth = $('.panel-cover').width();
    if (currentWidth < 960) {
      $('.panel-cover').addClass('panel-cover--collapsed');
    } else {
      $('.panel-cover').css('max-width',currentWidth);
      $('.panel-cover').animate({'max-width': '700px', 'width': '30%'}, 400, swing = 'swing', function() {} );
    }
  });

  if (window.location.hash && window.location.hash == "#blog") {
    $('.panel-cover').addClass('panel-cover--collapsed');
    $('.main-post-list').removeClass('hidden');
  }

  if (window.location.pathname.substring(0, 5) == "/tag/") {
    $('.panel-cover').addClass('panel-cover--collapsed');
  }

  $('.btn-mobile-menu__icon').click(function() {
    if ($('.navigation-wrapper').css('display') == "block") {
      $('.navigation-wrapper').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
        $('.navigation-wrapper').toggleClass('visible animated bounceOutUp');
        $('.navigation-wrapper').off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
      });
      $('.navigation-wrapper').toggleClass('animated bounceInDown animated bounceOutUp');

    } else {
      $('.navigation-wrapper').toggleClass('visible animated bounceInDown');
    }
    $('.btn-mobile-menu__icon').toggleClass('fa fa-list fa fa-angle-up animated fadeIn');
  });

  $('.navigation-wrapper .blog-button').click(function() {
    if ($('.navigation-wrapper').css('display') == "block") {
      $('.navigation-wrapper').on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
        $('.navigation-wrapper').toggleClass('visible animated bounceOutUp');
        $('.navigation-wrapper').off('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend');
      });

      $('.navigation-wrapper').toggleClass('animated bounceInDown animated bounceOutUp');
    }
    
    $('.btn-mobile-menu__icon').toggleClass('fa fa-list fa fa-angle-up animated fadeIn');
  });
});
