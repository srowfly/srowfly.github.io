---
layout: post
title: Learn BlocksKit
date: 2016-03-09 21:00:24.000000000 +09:00
---

抽时间看了下BlocksKit的部分代码, 了解了下内部实现, 总结一下.

###数组:

`初始化数组`:

	NSArray *arr = @[@"1a", @"2a", @"3a", @"4a"];
`分析每个方法`:

`1`.bk_each -> 断言判断下block, 对数组快速遍历(枚举);

    [arr bk_each:^(id obj) {
        NSLog(@"%@", obj);
    }];
    内部实现:
    - (void)bk_each:(void (^)(id obj))block
	{
	NSParameterAssert(block != nil);

	[self enumerateObjectsUsingBlock:^(id obj, NSUInteger 	idx, BOOL *stop) {
		block(obj);
	}];
	}
	打印结果:
    2016-03-15 15:58:59.469 TBlockskit[8744:193322] 1a
	2016-03-15 15:58:59.470 TBlockskit[8744:193322] 2a
	2016-03-15 15:58:59.470 TBlockskit[8744:193322] 3a
	2016-03-15 15:58:59.470 TBlockskit[8744:193322] 4a

`2`.bk_apply -> 也是枚举, 提供了两种枚举类型: NSEnumerationConcurrent 并发, 完成顺序是不确定的; NSEnumerationReverse 以反序方式枚举.

	- (void)bk_apply:(void (^)(id obj))block
	{
		NSParameterAssert(block != nil);

	[self enumerateObjectsWithOptions:NSEnumerationConcurrent usingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
		block(obj);
	}];
	}

`3`.bk_match -> 根据obj参数加上自己的筛选条件(此处没有用到参数), return YES会记录当前元素的下表, 然后根据self[index]返回对应的对象

	id obj = [arr bk_match:^BOOL(id obj) {
        return arc4random() % 2 ? YES: NO;
    }];
    NSLog(@"--%@", obj);
    
    内部实现:
    - (id)bk_match:(BOOL (^)(id obj))block
	{
	NSParameterAssert(block != nil);

	NSUInteger index = [self indexOfObjectPassingTest:^BOOL(id obj, NSUInteger idx, BOOL *stop) {
		return block(obj); //若 block(obj) 一直为 NO, 该数组会全部遍历之后才走下面判断
	}];

	if (index == NSNotFound)
		return nil;

	return self[index];
	}
	
`4`.bk_select -> 调用了objectsAtIndexes方法, 以数组形式返回了所有判断之后return YES的数据

	NSArray *select = [arr bk_select:^BOOL(id obj) {
        return arc4random() % 2? YES: NO;
    }];
    NSLog(@"select: %@", select);
    
    2016-03-15 16:54:20.452 TBlockskit[9043:232123] select: 	(
    2a,
    4a
	)
	内部实现: 
	- (NSArray *)bk_select:(BOOL (^)(id obj))block
	{
	NSParameterAssert(block != nil);
	return [self objectsAtIndexes:[self indexesOfObjectsPassingTest:^BOOL(id obj, NSUInteger idx, BOOL *stop) {
		return block(obj); 
	}]];
	}

`5`.bk_reject -> 跟bk_select刚好相反, 以数组形式返回了所有判断之后return NO的数据

	NSArray *reject = [arr bk_reject:^BOOL(id obj) {
        return NO;
    }];
    
    2016-03-15 16:54:20.452 TBlockskit[9043:232123] reject: (
    1a,
    2a,
    3a,
    4a
	)
	
	内部实现:
	- (NSArray *)bk_reject:(BOOL (^)(id obj))block
	{
	NSParameterAssert(block != nil);
	return [self bk_select:^BOOL(id obj) {
		return !block(obj);
	}];
	}
	
`6`.bk_map -> 枚举数组, 对数组对象进行操作, 若操作之后为nil就创建NSNull对象替代, 返回数组

	//例如拼上.png后缀
	NSArray *new = [arr bk_map:^id(id obj) {
        return [obj stringByAppendingString:@".png"];
    }];
	//源码
	- (NSArray *)bk_map:(id (^)(id obj))block
	{
		NSParameterAssert(block != nil);
		NSMutableArray *result = [NSMutableArray arrayWithCapacity:self.count];

		[self enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
		id value = block(obj) ?: [NSNull null];
		[result addObject:value];
		}];
		return result;
	}	
	
`7`.bk_reduce:withBlock: -> 对数组中对象进行指定操作, initial为初始数据, sum 为初始数据与每个对象操作之后的结果(initial要保护,防止为空), 例如拼接为字符串或者求和

	NSString *concentrated = [arr bk_reduce:@"_" withBlock:^id(id sum, id obj) {
        return [sum stringByAppendingString:obj];
    }];
	
	- (id)bk_reduce:(id)initial withBlock:(id (^)(id sum, id obj))block
	{
		NSParameterAssert(block != nil);

		__block id result = initial;
	//赋给result初始值, 再与数组中元素进行操作
		[self enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
		result = block(result, obj);
		}];
		return result;
	}
	
`8`.bk_reduceInteger:(NSInteger)initial withBlock: 与 bk_reduceFloat:(CGFloat)inital withBlock: 跟`7`方法相似, 只是操作的为NSInteger或CGFloat类型的

`9`.bk_any:与bk_none:都调用了bk_match:方法

	//数组中有一个满足条件就返回YES
	- (BOOL)bk_any:(BOOL (^)(id obj))block
	{
		return [self bk_match:block] != nil;
	}
	
	//数组中都不满足条件就返回YES
	- (BOOL)bk_none:(BOOL (^)(id obj))block
	{
		return [self bk_match:block] == nil;
	}
	
	//数组中都满足条件就返回YES
	- (BOOL)bk_all:(BOOL (^)(id obj))block
	{
		NSParameterAssert(block != nil);

		__block BOOL result = YES;

		[self enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
			if (!block(obj)) {
				//数组中有一个不满足条件就返回 NO
				result = NO;
				*stop = YES;
			}
		}];
		return result;
}
	
`10`.bk_corresponds:(NSArray *)list withBlock: -> 判断调用的数组与list是否相等, 判断条件外部指定(判断地址,内容,或转化之后的数据),例如以下判断:

	 NSArray *numbers = @[ @(1), @(2), @(3) ];
	 NSArray *letters = @[ @"1", @"2", @"3" ];
	 BOOL doesCorrespond = [numbers bk_corresponds:letters withBlock:^(id number, id letter) {
	return [[number stringValue] isEqualToString:letter];
 	}];
 	
 	源码:
 	- (BOOL)bk_corresponds:(NSArray *)list withBlock:(BOOL 	(^)(id obj1, id obj2))block
		{
	NSParameterAssert(block != nil);
	
	__block BOOL result = NO;
	[self enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
		//貌似要求当前数组长度要小于list长度...短了也相等, 醉了
		if (idx < list.count) {
			id obj2 = list[idx];
			result = block(obj, obj2);
		} else {
			result = NO;
		}
		*stop = !result;
	}];

	return result;
	}

看了下 NSDictionary、NSIndexSet、NSSet、NSOrderedSet 都是这样的用法, 就不一一累述~~先搞这些吧

###03-16-续集
####可变数组:

`1`.根据条件移除数组中的元素

	NSMutableArray *mArr = [@[@"a", @"b", @"c", @"d"] mutableCopy];
	
	//保留满足条件(return YES)的对象, 不满足移除;
    [mArr bk_performSelect:^BOOL(id obj) {
        return [mArr indexOfObject:obj] % 2;
    }];
    //留下[b,d];
    NSLog(@"return YES: %@", mArr);
    
    //移除满足条件(return YES)的对象, 不满足保留;
    [mArr bk_performReject:^BOOL(id obj) {
        return [mArr indexOfObject:obj] % 2;
    }];
    //留下[b];
    NSLog(@"return NO: %@", mArr);
    
`2`.对数组相应对象的处理

	NSMutableArray *mArr1 = [@[@"a", @"b", @"c.png", @"d.png"] mutableCopy];
    
    [mArr1 bk_performMap:^id(id obj) {
        return [obj hasSuffix:@".png"] ? obj :[obj stringByAppendingString:@".png"];
    }];
    NSLog(@"bk_performMap: %@", mArr1);
    //打印结果:
    2016-03-16 17:32:32.135 TBlockskit[1951:49505] bk_performMap: (
    "a.png",
    "b.png",
    "c.png",
    "d.png"
	)
	
	- (void)bk_performMap:(id (^)(id obj))block {
	NSParameterAssert(block != nil);
	NSMutableArray *new = [self mutableCopy];

	[self enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
		//外部处理为空的创建NSNull对象
		id value = block(obj) ?: [NSNull null];
		//处理之后与原obj相同的不变,
		if ([value isEqual:obj]) return;
		//不相同的用新对象替换老的
		new[idx] = value;
	}];
	//把数组用new替代
	[self setArray:new];
	}
	
`然而`.NSDictionary、NSIndexSet、NSSet、NSOrderedSet 也都是这样的用法

##over