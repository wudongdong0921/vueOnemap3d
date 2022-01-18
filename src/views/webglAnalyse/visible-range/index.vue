<!-- 可视域分析 -->
<template>
  <div class="visible_range_wrapper">
    <div id="cesiumContainer"></div>
    <div id="toolbar" v-show="toolbarFlag" class="param-container tool-bar">
        <el-button @click="chooseViewHandle" type="primary">绘制可视域</el-button>
        <el-button @click="clearBtn">清除</el-button>
      <!-- <button
        type="button"
        id="chooseView"
        @click="chooseViewHandle"
        class="button black"
      >
        绘制可视域
      </button>
      <button
        type="button"
        id="clear"
        @click="clearHandle"
        class="button black"
        style="margin:0 0 8px 0"
      >
        清除
      </button> -->
    </div>

    <div id="wrapper" v-show="wrapperFlag">
      <div id="login" class="animate form">
        <span class="close" @click="handleClose" aria-hidden="true">×</span>
        <form>
          <h3>属性编辑</h3>
          <p></p>
          <div>
            <label>方向(度)</label>
            <input
              type="range"
              id="direction"
              min="0"
              max="360"
              step="1.0"
              title="方向"
              data-bind="value: direction, valueUpdate: 'input'"
            />
            <input type="text" size="5" data-bind="value: direction" />
          </div>

          <div>
            <label>翻转(度)</label>
            <input
              type="range"
              id="pitch"
              min="-90"
              max="90"
              step="1.0"
              value="1"
              title="翻转"
              data-bind="value: pitch, valueUpdate: 'input'"
            />
            <input type="text" size="5" data-bind="value: pitch" />
          </div>

          <div>
            <label>距离(米)</label>
            <input
              type="range"
              id="distance"
              min="1"
              max="500"
              step="1.0"
              value="1"
              title="距离"
              data-bind="value: distance, valueUpdate: 'input'"
            />
            <input type="text" size="5" data-bind="value: distance" />
          </div>

          <div>
            <label>水平视场角(度)</label>
            <input
              type="range"
              id="horizonalFov"
              min="1"
              max="120"
              step="1"
              value="1"
              title="水平视场角"
              data-bind="value: horizontalFov, valueUpdate: 'input'"
            />
            <input type="text" size="5" data-bind="value: horizontalFov" />
          </div>

          <div>
            <label>垂直视场角(度)</label>
            <input
              type="range"
              id="verticalFov"
              min="1"
              max="90"
              step="1.0"
              value="1"
              title="垂直视场角"
              data-bind="value: verticalFov, valueUpdate: 'input'"
            />
            <input type="text" size="5" data-bind="value: verticalFov" />
          </div>
          <div class="square">
            <label>可见区域颜色</label
            ><el-color-picker @change="colorChangeY"  show-alpha v-model="color"></el-color-picker>
          </div>
          <div class="square">
            <label>不可见区域颜色</label
            ><el-color-picker @change="colorChangeH" show-alpha v-model="colorH"></el-color-picker>
          </div>
          <p><label>本例中观察者附加高度：1.8 米</label></p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
        color: 'rgba(19, 206, 102, 0.8)',
        colorH: '#rgba(19, 206, 102, 0.8)',
      wrapperFlag: false,
      toolbarFlag: false,
      viewer: null,
      scene: null,
      pointHandler: null,
      viewshed3D: null,
      viewModel: {}
    };
  },
  mounted() {
    let that = this;
    var viewer = new Cesium.Viewer('cesiumContainer');
        viewer.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
            url: 'https://dev.virtualearth.net',
            mapStyle: Cesium.BingMapsStyle.AERIAL,
            key: URL_CONFIG.BING_MAP_KEY
        }));
        var scene = viewer.scene;
        scene.shadowMap.darkness = 1.275; //设置第二重烘焙纹理的效果（明暗程度）
        scene.skyAtmosphere.brightnessShift=0.4;  //修改大气的亮度
        scene.debugShowFramesPerSecond = true;
        scene.hdrEnabled = false;
        scene.sun.show = false;
        // 01设置环境光的强度-新处理CBD场景
        scene.lightSource.ambientLightColor = new Cesium.Color(0.65, 0.65, 0.65, 1);
        // 添加光源
        var position1 = new Cesium.Cartesian3.fromDegrees(116.261209157595,  39.3042238956531, 200);
        //光源方向点

        var targetPosition1 = new Cesium.Cartesian3.fromDegrees(116.261209157595, 39.3042238956531,430);
        var dirLightOptions = {
            targetPosition: targetPosition1,
            color: new Cesium.Color(1.0, 1.0, 1.0, 1),
            intensity: 0.55
        };
        var directionalLight_1 = new Cesium.DirectionalLight(position1, dirLightOptions);
        scene.addLightSource(directionalLight_1);
        var viewPosition;
        this.toolbarFlag = true
        if (!scene.pickPositionSupported) {
            alert('不支持深度纹理,可视域分析功能无法使用（无法添加观测）！');
        }
        // 先将此标记置为true，不激活鼠标移动事件中对可视域分析对象的操作
        scene.viewFlag = true;
        var pointHandler = new Cesium.DrawHandler(viewer, Cesium.DrawMode.Point);
        // 创建可视域分析对象
        var viewshed3D = new Cesium.ViewShed3D(scene);
        var colorStr1 = viewshed3D.visibleAreaColor.toCssColorString();
        var colorStr2 = viewshed3D.hiddenAreaColor.toCssColorString();
        // $("#colorPicker1").spectrum({
        //     color: colorStr1,
        //     showPalette: true,
        //     showAlpha: true,
        //     localStorageKey: "spectrum.demo",
        //     palette: palette
        // });
        // $('#colorPicker2').spectrum({
        //     color: colorStr2,
        //     showPalette: true,
        //     showAlpha: true,
        //     localStorageKey: "spectrum.demo",
        //     palette: palette
        // });
        var widget = viewer.cesiumWidget;
        try {
            //添加S3M图层
            // var promise = scene.open(URL_CONFIG.SCENE_CBD);
            var promise = scene.open('http://192.168.1.189:8090/iserver/services/3D-BaiShanShiJiangYuanQu/rest/realspace')
            Cesium.when(promise, function (layers) {
                // 图层加载完成,设置相机位置
                scene.camera.setView({
                    destination: Cesium.Cartesian3.fromDegrees(126.606585911968,  42.0081187082649,  700),
                    orientation: {
                        heading: 1.6310555040487564,
                        pitch: 0.0017367269669030794,
                        roll: 3.007372129104624e-12
                    }
                });
                for (var i = 0; i < layers.length; i++) {
                    layers[i].selectEnabled = false;
                }
            }, function (e) {
                if (widget._showRenderLoopErrors) {
                    var title = '加载SCP失败，请检查网络连接状态或者url地址是否正确？';
                    widget.showErrorPanel(title, undefined, e);
                }
            });
        } catch (e) {
            if (widget._showRenderLoopErrors) {
                var title = '渲染时发生错误，已停止渲染。';
                widget.showErrorPanel(title, undefined, e);
            }
        }
        var viewModel = {
            direction: 1.0,
            pitch: 1.0,
            distance: 1.0,
            verticalFov: 1.0,
            horizontalFov: 1.0,
            visibleAreaColor: '#ffffffff',
            invisibleAreaColor: '#ffffffff'
        };

        Cesium.knockout.track(viewModel);
        var toolbar = document.getElementById('wrapper');
        Cesium.knockout.applyBindings(viewModel, toolbar);
        Cesium.knockout.getObservable(viewModel, 'direction').subscribe(
            function (newValue) {
                viewshed3D.direction = parseFloat(newValue);
            }
        );
        Cesium.knockout.getObservable(viewModel, 'pitch').subscribe(
            function (newValue) {
                viewshed3D.pitch = parseFloat(newValue);
            }
        );
        Cesium.knockout.getObservable(viewModel, 'distance').subscribe(
            function (newValue) {
                viewshed3D.distance = parseFloat(newValue);
            }
        );
        Cesium.knockout.getObservable(viewModel, 'verticalFov').subscribe(
            function (newValue) {
                viewshed3D.verticalFov = parseFloat(newValue);

            }
        );
        Cesium.knockout.getObservable(viewModel, 'horizontalFov').subscribe(
            function (newValue) {
                viewshed3D.horizontalFov = parseFloat(newValue);
            }
        );
        Cesium.knockout.getObservable(viewModel, 'visibleAreaColor').subscribe(
            function (newValue) {
                var color = Cesium.Color.fromCssColorString(newValue);
                viewshed3D.visibleAreaColor = color;
            }
        );
        Cesium.knockout.getObservable(viewModel, 'invisibleAreaColor').subscribe(
            function (newValue) {
                var color = Cesium.Color.fromCssColorString(newValue);
                viewshed3D.hiddenAreaColor = color;
            }
        );
        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        // 鼠标移动时间回调
        handler.setInputAction(function (e) {
            // 若此标记为false，则激活对可视域分析对象的操作
            if (!scene.viewFlag) {
                //获取鼠标屏幕坐标,并将其转化成笛卡尔坐标
                var position = e.endPosition;
                var last = scene.pickPosition(position);

                //计算该点与视口位置点坐标的距离
                var distance = Cesium.Cartesian3.distance(viewPosition, last);

                if (distance > 0) {
                    // 将鼠标当前点坐标转化成经纬度
                    var cartographic = Cesium.Cartographic.fromCartesian(last);
                    var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                    var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                    var height = cartographic.height;
                    // 通过该点设置可视域分析对象的距离及方向
                    viewshed3D.setDistDirByPoint([longitude, latitude, height]);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(function (e) {
            //鼠标右键事件回调，不再执行鼠标移动事件中对可视域的操作
            scene.viewFlag = true;
            that.wrapperFlag = true;
            viewModel.direction = viewshed3D.direction;
            viewModel.pitch = viewshed3D.pitch;
            viewModel.distance = viewshed3D.distance;
            viewModel.horizontalFov = viewshed3D.horizontalFov;
            viewModel.verticalFov = viewshed3D.verticalFov;

        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        pointHandler.drawEvt.addEventListener(function (result) {
            var point = result.object;
            var position = point.position;
            viewPosition = position;

            // 将获取的点的位置转化成经纬度
            var cartographic = Cesium.Cartographic.fromCartesian(position);
            var longitude = Cesium.Math.toDegrees(cartographic.longitude);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude);
            var height = cartographic.height + 1.8;
            point.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

            if (scene.viewFlag) {
                // 设置视口位置
                viewshed3D.viewPosition = [longitude, latitude, height];
                viewshed3D.build();
                // 将标记置为false以激活鼠标移动回调里面的设置可视域操作
                scene.viewFlag = false;
            }
        });
    this.viewer = viewer;
    this.scene = scene;
    this.viewshed3D = viewshed3D;
    this.pointHandler = pointHandler;
  },
  methods: {
    chooseViewHandle() {
      if (this.pointHandler.active) {
        return;
      }
      //先清除之前的可视域分析
      this.viewer.entities.removeAll();
      this.viewshed3D.distance = 0.1;
      this.scene.viewFlag = true;

      //激活绘制点类
      this.pointHandler.activate();
    },
    clearBtn() {
      this.wrapperFlag = false;
      this.viewer.entities.removeAll();
      this.viewshed3D.distance = 0.1;
      this.scene.viewFlag = true;
    },
    colorChangeY(data) {
        if(!data) {
            data = this.color
        }
        var color = Cesium.Color.fromCssColorString(data);
        this.viewshed3D.visibleAreaColor = color
    },
    colorChangeH (data) {
        if(!data) {
            data = this.colorH
        }
        var color = Cesium.Color.fromCssColorString(data);
        this.viewshed3D.hiddenAreaColor = color
    },
    handleClose() {
        this.wrapperFlag = false;
    }
  }
};
</script>

<style>
#wrapper {
  min-height: 560px;
  margin: 0px auto;
  position: absolute;
  top: 100px;
  right: 0px;
  width: 300px;
  height: 100%;
}
.square {
  margin-left: 5px;
  width: 120px;
  height: 30px;
  max-width: 150px;
  display: inline-block;
}
#wrapper label {
    color: rgb(64, 92, 96);
    position: relative;
    display:block
}
#wrapper .close{
    cursor: pointer;
}
#login {
  position: absolute;
  z-index: 22;
  top: 0px;
  width: 88%;
  padding: 18px 6% 20px 6%;
  margin: 0 0 35px 0;
  background: rgb(247, 247, 247);
  border: 1px solid rgba(147, 184, 189, 0.8);
  -webkit-box-shadow: 0pt 2px 5px rgba(105, 108, 109, 0.7),
    0px 0px 8px 5px rgba(208, 223, 226, 0.4) inset;
  -moz-box-shadow: 0pt 2px 5px rgba(105, 108, 109, 0.7),
    0px 0px 8px 5px rgba(208, 223, 226, 0.4) inset;
  box-shadow: 0pt 2px 5px rgba(105, 108, 109, 0.7),
    0px 0px 8px 5px rgba(208, 223, 226, 0.4) inset;
  -webkit-box-shadow: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
}
</style>
