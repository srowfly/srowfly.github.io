---
layout: post
title: 解决iOS10_textField文字下沉
excerpt: 就是你了
date: 2016-10-27 17:07:24.000000000 +09:00
---

近期很多人反馈iOS10中, textField在输入中文多的情况下,文字会下沉,找了多篇帖子无果,后跟同事找到了解决方案, 亲测有效;

重写layoutSubviews方法, 改变子视图中scrollview的偏移量

	- (void)layoutSubviews {
    	[super layoutSubviews];
    	for (UIScrollView *view in self.subviews) {
        	if ([view isKindOfClass:[UIScrollView class]]) {
          	  CGPoint offset = view.contentOffset;
          	  if (offset.y != 0) {
          	      offset.y = 0;
          	      view.contentOffset = offset;
          	  }
          	  break;
        	}
   	 	}
	}
	
