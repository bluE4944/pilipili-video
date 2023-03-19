<template>
  <div class="hello">
    <a-row>
      <a-col span="10" push="1" :xs="22">
        <img
        :width="'100%'"
        src="../../public/images-ppt/1672655299949.png"/>
      </a-col>
      <a-col span="10"  push="1" :xs="22">
        <a-card v-if="isPc">
          <a-calendar>
            <ul slot="dateCellRender" slot-scope="value" class="events">
              <li v-for="item in getListData(value)" :key="item.content">
                <a-badge :status="item.type" :text="item.content" />
              </li>
            </ul>
            <template slot="monthCellRender" slot-scope="value">
              <div v-if="getMonthData(value)" class="notes-month">
                <section>{{ getMonthData(value) }}</section>
                <span>Backlog number</span>
              </div>
            </template>
          </a-calendar>
        </a-card>
      </a-col>
    </a-row>
    
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      isPc: this.$store.state.isPc,
    }
  },
  methods: {
    getListData(value) {
      let listData;
      switch (value.date()) {
        case 8:
          listData = [
            { type: 'warning', content: 'This is warning event.' },
            { type: 'success', content: 'This is usual event.' },
          ];
          break;
        case 10:
          listData = [
            { type: 'warning', content: 'This is warning event.' },
            { type: 'success', content: 'This is usual event.' },
            { type: 'error', content: 'This is error event.' },
          ];
          break;
        case 15:
          listData = [
            { type: 'warning', content: 'This is warning event' },
            { type: 'success', content: 'This is very long usual event。。....' },
            { type: 'error', content: 'This is error event 1.' },
            { type: 'error', content: 'This is error event 2.' },
            { type: 'error', content: 'This is error event 3.' },
            { type: 'error', content: 'This is error event 4.' },
          ];
          break;
        default:
      }
      return listData || [];
    },

    getMonthData(value) {
      if (value.month() === 8) {
        return 1394;
      }
    },
  },
  mounted() {
    this.isPc = this.$store.state.isPc;
    debugger;
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .events {
  list-style: none;
  margin: 0;
  padding: 0;
}
.events .ant-badge-status {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-overflow: ellipsis;
  font-size: 12px;
}
.notes-month {
  text-align: center;
  font-size: 28px;
}
.notes-month section {
  font-size: 28px;
}
</style>
