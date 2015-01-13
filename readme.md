# Tab v0.9 beta Doc

### Features 特性

* 包含前舌签控件（SubShowClass）的全部基础功能。
* 增加渲染完成，激活前、后等三个定制回调。
* 强调灵活性和可维护性：增加对触屏的滑动响应；支持定制切换函数等以支持复杂的RIA需求。


### 构造参数

* config (Object)：配置对象，包含以下参数(带有“*”标识为必选)：

  * bonds (Array)：绑定tab与相关dom，复杂数组格式，每组一对，可传入dom或id字符串。
  * selected (String)：可修改激活项所绑定的内容容器的className，默认值'tab_selected'。
  * startOn (Number)：可修改起始激活项序号，默认值0。
  * auto (Boolean|Number)：设置自动播放，可传入布尔值或间隔秒数；默认值false；如传入true，间隔秒数默认值5。
  * trigger (String)：激活触发事件，默认值'mouseover'，可选值：'click', 'mousedown'等。
  * touchDir (Boolean|String)：选择采用触屏滑动切换，可传入布尔值或字符串'v'（竖直）及'h'（水平）；默认值'v'；如传入true，滑动切换方向默认值'h'。
  * customSelect (Fuction)：自定义切换函数，this指向控件实例自身。

  **以下是回调部分**
* config (Object):

  * onRender ()：控件渲染完毕，this指向控件实例自身，下同。
  * onBefore ()：每次切换激活项之前执行。
  * onAfter ()：每次切换激活项之后执行。

### 公有方法

**select(index[, onceCallback])**

  (Avoid)：手动切换至指定序号的项。

参数

* index (Number): 所切换的指定序号。
* onceCallback (Function): 可选参数，本次切换后执行的回调，仅在当次切换时执行一次

**prev()**

  (Avoid)：手动切换至当前项的前一项。

**next()**

  (Avoid)：手动切换至当前项的后一项。

.. order(orderList)

..   (Avoid)：手动调整选项的依次激活次序，将改变select、prev、next、autoPlay的表现。

.. 参数

.. * orderList (Array): 新的选项卡序号，如[1, 2, 0]。

**autoPlay(auto)**

  (Avoid)：设置自动播放。

参数

* auto (Boolean|Number): 可为布尔值或自动播放间隔秒数，传入false将暂停自动播放；如传入true，自动播放间隔秒数默认值5（s）。

**enable(isEnbale)**

  (Avoid)：暂时禁用选项卡功能。

参数

* isEnbale (Boolean): 是否禁用选项卡功能。


### Examples 示例

[demo](index.html)

[最小实例](index.html#demo1)

```javascript
var tab0 = new Tab({
    bonds: [
        ['tab0_0', 'tab0_c0'],
        ['tab0_1', 'tab0_c1'],
        ['tab0_2', 'tab0_c2']
    ]
});
```

[配置选项及使用控件方法](index.html#demo2)

```javascript
var tab1 = new Tab({
    bonds: [
        ['tab1_0', 'tab1_c0'],
        ['tab1_1', 'tab1_c1'],
        ['tab1_2', 'tab1_c2']
    ], // 绑定dom，复杂数组格式，每组一对
    selected: 'tab_selected', // 选择项的className，默认值"tab_selected"
    startOn: 2, // 初始项，默认值0
    auto: 2, // 自动播放，可传入布尔值或间隔秒数，如传入true，间隔秒数默认为5
    trigger: 'mouseover', // 触发条件，默认值"mouseover"
    touchDir : 'v', // 触屏滑动切换，可传入布尔值或字符串'v'（竖直）及'h'（水平）；如不传或传入true，滑动切换方向默认为'h'
    customSelect : null, // 自定义切换函数
    onRender: function() {},
    onBefore: function(to) {
        this.doms.conts[to].innerHTML = '切换至第' + to + '项前';
    },
    onAfter: function(to) {
        var me = this;
        setTimeout(function () {
            me.doms.conts[to].innerHTML = '切换至第' + to + '项后';
        }, 500);
    }
});
```

[手动绑定tab值对](index.html#demo3)

```javascript
var tab2 = new Tab();
tab2.add('tab2_0', 'tab2_c0');
tab2.add('tab2_1', 'tab2_c1');
tab2.add('tab2_2', 'tab2_c2');
```

[定制切换函数](index.html#demo4)

```javascript
var tab3 = new Tab({
    bonds: [
        ['tab3_0', 'tab3_c0'],
        ['tab3_1', 'tab3_c1'],
        ['tab3_2', 'tab3_c2'],
        ['tab3_3', 'tab3_c3'],
        ['tab3_4', 'tab3_c4']
    ],
    trigger : 'click',
    auto : 6,
    customSelect : function (i) {
        var s = this.states;
        for(var j = 0; j < s.total; j ++){
            if(i == j){
                this.doms.conts[i].style.display = 'block';
                this._addClass(this.doms.conts[i], 'expandOpen');
            }
            else{
                this.doms.conts[j].style.display = 'none';
                this._removeClass(this.doms.conts[j], 'expandOpen');
            }
        }
    } // 自定义切换函数
});
```