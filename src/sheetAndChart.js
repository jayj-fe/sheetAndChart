import loadingJs from "./loading";
import Papa from "papaparse";
import Highcharts from "highcharts";
const loaderJs = new loadingJs();

class SheetAndChart{
  constructor(targetId = "sheet-chart"){
    this.targetId = targetId;
    this.SheetAndChart = document.getElementById(this.targetId);
    this.defaultURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRervzNe8_P9ybdxWZQK3XtBS0ExtJdyDNq2wHj68CU88QaN2XrhvOkOxod7bEeb_lcJ0E5lvTF_nhe/pub?output=csv&gid=";
    this.device = navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i) ? "mobile" : "pc";
    this.title = "尹대통령 국정운영 지지율";
    this.chartElId = null;
    this.chartEl = null;
    this.chartInfo = null;
    this.moreBtn = null;
    this.dimmedEl = null;
    this.layerDiv = null;
    this.chartData = [];
    this.callData = null;

    this.drawingElement();
  }

  drawingElement(){
    const innerHtml = `
      <div class="sheet-chart-header">
        <h1>${this.title}</h1>
        <button class="more-btn" type="button" id="${this.targetId}-more-btn"><svg id="Components_icon_search_32" data-name="Components/icon/search_32" xmlns="http://www.w3.org/2000/svg" width="12.061" height="12.057" viewBox="0 0 12.061 12.057"><g id="Oval" fill="none" stroke="#111" stroke-miterlimit="10" stroke-width="1.5"><ellipse cx="4.778" cy="4.777" rx="4.778" ry="4.777" stroke="none"/><ellipse cx="4.778" cy="4.777" rx="4.028" ry="4.027" fill="none"/></g><path id="Line" d="M3.063,3.065,0,0" transform="translate(7.937 7.931)" fill="none" stroke="#111" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.5"/></svg></button>
        <div class="percent-value">
          <p class="denial">부정<strong id="${this.targetId}-denial"></strong>
          </p>
          <p class="positive">긍정<strong id="${this.targetId}-positive"></strong>
          </p>
        </div>
      </div>
      <div class="sheet-chart-chart" id="${this.targetId}-chart"></div>
      <p class="sheet-chart-info" id="${this.targetId}-info"></p>
    `;

    this.SheetAndChart.insertAdjacentHTML('afterbegin', innerHtml);

    loaderJs.show(this.targetId);

    this.chartElId = `${this.targetId}-chart`;
    this.chartEl = document.getElementById(this.chartElId);
    this.moreBtn = document.getElementById(`${this.targetId}-more-btn`);
    this.chartInfo = document.getElementById(`${this.targetId}-info`);

    this.dimmedEl = document.createElement('div');
    this.dimmedEl.classList.add('dimmed');

    this.setChartOption();
    this.setChartList();
  }

  getGoogleSheetData(url){
    const that = this;
    const data = new Promise((resolve) => {
      Papa.parse(this.defaultURL+url, {download: true, header: true, complete (results, file) { resolve( that.callData = results.data )}});
    });
    
    return data.then(()=>{
      return that.callData
    })
  }

  setChartList(){                      
    const callApi = new Promise((resolve) => { resolve( this.getGoogleSheetData(0)) });

    callApi.then(()=>{
      this.chartData = this.callData.splice(1);
      this.setChartData(0, ()=>{
        const data = this.chartData[0];

        this.drawingChart({chartTarget : this.chartEl, chartTargetInfo : this.chartInfo, chartData : this.chartData[0], callType : "mini" });

        this.chartData.map((el,idx)=>{
          if(idx !== 0){
            this.setChartData(idx);
          }
        })

        document.getElementById(`${this.targetId}-positive`).innerHTML = data.positive[data.positive.length-5] + "%";
        document.getElementById(`${this.targetId}-denial`).innerHTML = data.denial[data.denial.length-5] + "%";
        this.moreBtn.addEventListener('click', () => { this.layerOpen() });

        // loaderJs.remove(this.targetId);
      });
    })
  }

  setChartData(idx, callBackFn){
    const callApi = new Promise((resolve) => { resolve(this.getGoogleSheetData(`${this.chartData[idx].url}`)); });
    
    callApi.then(()=>{
      const data = this.callData.splice(1);
      
      /* 차트 여백을 위한 추가작업 */
      data.unshift({categories: '', positive: 'null', denial: 'null'});
      data.unshift({categories: '', positive: 'null', denial: 'null'});
      data.unshift({categories: '', positive: 'null', denial: 'null'});
      data.unshift({categories: '', positive: 'null', denial: 'null'});
      data.push({categories: '', positive: 'null', denial: 'null'})
      data.push({categories: '', positive: 'null', denial: 'null'})
      data.push({categories: '', positive: 'null', denial: 'null'})
      data.push({categories: '', positive: 'null', denial: 'null'})

      const dataLength = data.length;
      const categories = [];
      const minifyCategories = [];
      const positive = [];
      const denial = [];

      data.map((ele) => {
        let miniCategorie = ele.categories;

        if(ele.categories !== ''){
          let arr = ele.categories.split(" ");
          const year = arr[0].slice(2,-1);
          let month = arr[1].slice(0,-1);
          month = ("0"+month).slice(-2);
          let day = arr[2].slice(0,-1);
          day = ("0"+day).slice(-2);

          miniCategorie = `${year}.${month}.${day}`;
        }

        categories.push(ele.categories);
        minifyCategories.push(miniCategorie);
        positive.push(ele.positive === "null" ? null : Number(ele.positive))
        denial.push(ele.denial === "null" ? null : Number(ele.denial))
      })

      this.chartData[idx] = {
        ...this.chartData[idx],
        categories : categories,
        minifyCategories : minifyCategories,
        positive : positive,
        denial : denial,
        max : dataLength-2,
        tickPositions : [4, Math.ceil(((dataLength-5) * 30) / 100), Math.ceil(((dataLength-5) * 70) / 100), dataLength-5],
        miniTickPositions : [9, dataLength-5]
      }

      if(callBackFn){
        callBackFn()
      }
    });
  }

  setChartOption(){
    Highcharts.setOptions({
      credits: {
        type: 'line',
        enabled: false
      },
      chart: {
        events: {
          'load': function() {
            if (this.series[0].data.length > 0) {
              let points = [],
                series = this.series,
                pointsnum = this.series[0].data.length - 5;

              for (let i = 0; i < series.length; i++) {
                points.push(series[i].data[0]);
              }

              this.xAxis[0].drawCrosshair(series[0].points[pointsnum], series[1].points[pointsnum]);
            }
          },
        },
        style: {fontFamily:"Pretendard Variable"},
        spacingTop: 0,
        spacingLeft: 0,
        spacingRight: 0,
        spacingBottom: 0,
        backgroundColor: 'none',
      },
      xAxis: {
        tickWidth: 1,
        tickmarkPlacement: 'on',
        lineColor: '#bbb',
        tickColor: '#bbb',
        crosshair: {
          width: 1,
          color:'#787878'
        },
        tickPosition: 'inside',
        labels: {
          align: 'center',
          x: 0,
          y: 20,
          rotation: 0,
          style: {
            fontSize: '12',
            color: '#bbb',
            textOverflow: 'none',
            whiteSpace: 'nowrap',
          },
        },
      },
      plotOptions: {
        series: {
          pointPlacement: 'on',
          events: {
            legendItemClick: function() {
              return false;
            }
          },
          line: {
            dataLabels: {
              enabled: true
            },
            enableMouseTracking: false
          },
          marker: {
            enabled: false,
            lineWidth: 2,
            symbol: 'circle',
            fillColor: 'white',
            radius:3,
          }
        }
      },
      yAxis: {
        tickInterval: 50,
        gridLineColor: '#ddd',
        gridLineWidth: 1,
        gridLineDashStyle: 'dash',
        title: {
          enabled: false
        },
        labels: {
          style: {fontSize: '12', color: '#bbb'},
          align: 'left',
          x: 2,
          y: 16,
          formatter: function () {
            if(this.isFirst){
              return '';
            } else {
              return this.value + '%';
            }
          }
        }
      },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: '#FFFFFF',
        borderColor: '#dedede',
        borderWidth: this.device === "mobile" ? 0 : 1,
        shadow: false,
        padding:0,
        formatter: function () {
          return '<div class="tooltip-wrap"><div class="tooltip-flex">'+
            this.points.reduce(function(s, point) {
            return s + '<div class="tooltip-series" style="color:'+ point.color +';"><span style="background:'+ point.color +';"></span>' + point.series.name + '<b>' + 
              point.y + '%</b></div>';
          }, '<p class="tooltip-date">' + this.x + '</p>' ) + '</div></div>';
        }
      },
      title: {
          text: null
      },
      exporting: {
        enabled: false
      },
    });
  }

  drawingChart({chartTarget, chartTargetInfo, chartData, callType}){
    const seriesStats = callType === "mini" ? false : true; 

    const chart = Highcharts.chart(chartTarget, {
      chart: callType === "mini" ? {height : 130, background:"none"} : {height: 275, background : "#fff"},
      xAxis: {
        tickPositions: callType === "mini" || this.device === "mobile" ? chartData.miniTickPositions : chartData.tickPositions,
        min: callType === "mini" ? -3 : 0,
        max: chartData.max,
        categories: callType === "mini" || this.device === "mobile" ? chartData.minifyCategories : chartData.categories,
      },
      series: [{
        name: '긍정',
        color:'#c9151e',
        showInLegend: false,
        marker: { lineColor: '#c9151e', fillColor: 'white', },
        lineWidth: 3,
        data: chartData.positive,
        pointPlacement: 'on',
        enableMouseTracking: seriesStats
      }, {
        name: '부정',
        color:'#004ea2',
        showInLegend: false,
        marker: { lineColor: '#004ea2', fillColor: 'white', },
        lineWidth: 3,
        data: chartData.denial,
        pointPlacement: 'on',
        enableMouseTracking: seriesStats
      }],
      // mobile
      responsive: this.device !== "pc" && callType !== "mini" ? {
        rules: [{
          condition: {
            maxWidth: 768,
          },
          chartOptions: {
            chart :{
              spacingTop: 148,
            },
            xAxis: {
              tickPositions: chartData.miniTickPositions,
            },
            tooltip: {
              useHTML: true,
              positioner: function() {
                return {
                  x: 0,
                  y: 0,
                };
              },
              formatter: function () {
                const clientWidth = document.querySelector('.ar-layer-chart').clientWidth;
                const date = this.x.split('.');
                return '<div class="tooltip-wrap" style="width:'+ clientWidth +'px;"><div class="tooltip-img"></div><div class="tooltip-flex">'+
                this.points.reduce(function(s, point) {
                  return s + '<div class="tooltip-series"><div style="color:'+point.series.color+'">' + point.series.name + '<b>' +
                    point.y + '%</b></div></div>';
                }, '<b class="tooltip-date">20' + date[0] + '년 ' + date[1] + '월 ' + date[2] + '일' +'</b>' ) + '<div class="tooltip-ac">터치하여 날짜별 지지율을 확인하세요</div></div></div></div>';
              },
            },
          },
        }],
      } : {}
    });

    chartTargetInfo.innerHTML = chartData.info;
    if(seriesStats){
      chartTarget.addEventListener('mouseleave', () => {
        this.handleGraphMouseLeave(chart);
      });
    }
    chart.tooltip.refresh([chart.series[0].points[chartData.max-3], chart.series[1].points[chartData.max-3]])
  }

  handleGraphMouseLeave(chart){
    if (chart.series[0].data.length > 0) {
      const points = [];
      const series = chart.series;
      const pointsnum = chart.series[0].data.length - 5;
      for (let i = 0; i < series.length; i++) {
        points.push(series[i].data[0]);
      }
      setTimeout(function() {
        chart.xAxis[0].drawCrosshair(series[0].points[pointsnum], series[1].points[pointsnum]);
      }, 10);
    }
  }

  layerOpen(){
    this.dimmedEl.classList.add('on');
    this.createLayer();
  }
  
  layerClose(){
    this.dimmedEl.classList.remove('on');
    this.layerDiv.remove();
  }
  
  createLayer(){
    this.layerDiv = document.createElement('div');

    this.layerDiv.innerHTML = `
      <h1>${this.title}</h1>
      <button type="button" class="ar-layer-close" id="ar-layer-close"><svg xmlns="http://www.w3.org/2000/svg" width="18.121" height="18.121" viewBox="0 0 18.121 18.121"><g id="그룹_7193" data-name="그룹 7193" transform="translate(-1457.12 -355.939)"><g id="Components_icon_close_black_32" data-name="Components/icon/close_black_32" transform="translate(1458.181 357)"><g id="Group"><path id="Line_2_Copy_3" data-name="Line 2 Copy 3" d="M16,16,0,0" transform="translate(0 0)" fill="none" stroke="#000" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.5"/><path id="Line_2_Copy_3-2" data-name="Line 2 Copy 3" d="M0,16,16,0" transform="translate(0)" fill="none" stroke="#000" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.5"/></g></g></g></svg></button>
      <div class="ar-layer-tab" id="ar-layer-tab"></div>
      <p class="ar-layer-pc-info">그래프를 클릭하여 날짜별 지지율을 확인하세요</p>
      <div class="ar-layer-chart" id="ar-layer-chart"></div>
      <p class="ar-layer-chartInfo" id="ar-layer-chartInfo">
        * info<br>
        * info
      </p>
    `;

    this.layerDiv.setAttribute('id', 'ar-layer');
    this.layerDiv.setAttribute('class', 'ar-layer');
    this.SheetAndChart.appendChild(this.dimmedEl);
    this.SheetAndChart.appendChild(this.layerDiv);

    const close = document.getElementById("ar-layer-close");
    const tab = document.getElementById("ar-layer-tab");
    const chart = document.getElementById("ar-layer-chart");
    const chartInfo = document.getElementById("ar-layer-chartInfo");

    let activeTabIdx = 0;

    this.chartData.map((el, idx) => {
      const tabBtn = document.createElement('button');
      tabBtn.setAttribute('type', 'button');
      tabBtn.innerHTML = el.title;
      tabBtn.addEventListener('click', () => {
        tabBtnList[activeTabIdx].classList.remove('on');
        this.drawingChart({chartTarget : chart, chartTargetInfo : chartInfo, chartData : this.chartData[idx]})
        activeTabIdx = idx;
        tabBtnList[activeTabIdx].classList.add('on');
      });

      tab.appendChild(tabBtn);
    })

    const tabBtnList = tab.querySelectorAll('button');
    tabBtnList[activeTabIdx].classList.add('on');
    close.addEventListener('click', () => { this.layerClose() });

    this.drawingChart({chartTarget : chart, chartTargetInfo : chartInfo, chartData : this.chartData[0]})
  }
}

document.addEventListener('readystatechange', (e) => {
  if (e.target.readyState === 'interactive') {
    const SheetAndChartElement = new SheetAndChart("sheet-chart");
  }
});