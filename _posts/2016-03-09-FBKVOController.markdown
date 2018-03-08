---
layout: post
title: 初识 FBKVOController
date: 2016-03-09 18:32:24.000000000 +09:00
---
###Installation 

* 在podfile中添加 pod 'KVOController'

  `pod install` or `pod update`
  
`FBKVOController`的一般用法
   
![Alt text](/assets/images/kvo_first.jpg)

###代码结构

1.`FBKVOController`

 	对外公开的类，对外提供了初始化，数种监听的方法。
①: 初始化FBKVOController
 	
![Alt text](/assets/images/kvo_second.jpg)

②: 观察对象的keypath

![Alt text](/assets/images/kvo_third.jpg)

③: 添加观察之后的下一步传递, 做保护并传递到真正的观察者FBKVOSharedController

![Alt text](/assets/images/kvo_forth.jpg)

2.`_FBKVOInfo`
	
 	内部类，用来记录监听所需的参数信息。
3.`_FBKVOSharedController`

内部类，真正实现kvo的类，通过FBKVOController的外部方法调用。

	
![Alt text](/assets/images/kvo_fifth.jpg)

通过以下方式将最终的消息转发

![Alt text](/assets/images/kvo_sixth.jpg)

总结: 小弟目前只对FBKVOController的使用方法及流程有了初步的了解, 具体实现还不是很熟悉, 下次补全~!