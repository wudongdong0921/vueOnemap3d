<template>
  <div class="header-wrapper">
    <div class="header-box">
      <div class="header-right">
        <ul>
          <li @click="showFlood"><a href="#">三维分析</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
export default {
  methods: {
    ...mapMutations(["hadleFlood", "handleFloodTetrn"]),
    showFlood() {
      this.hadleFlood(true);
      this.handleFloodTetrn(false);
    },
    showFloodTern() {
      this.handleFloodTetrn(true);
      this.hadleFlood(false);
    }
  }
};
</script>

<style>
.header-wrapper {
  position: relative;
  right: 0px;
  top: 0px;
  width: 100%;
  max-height: 100px;
  padding: 15px 0;
  z-index: 999;
  background: url("./../../assets/img/map/u1.png");
}
.header-wrapper .header-box {
  color: #fff;
  height: auto;
  overflow: hidden;
}
.header-wrapper .header-box .header-right {
  float: right;
  margin-right: 40px;
}
.header-wrapper .header-box .header-right li {
  display: table;
  float: left;
}
.header-wrapper .header-box .header-right li a {
  display: table-cell;
  vertical-align: middle;
  padding: 10px;
  color: #fff;
}
</style>
