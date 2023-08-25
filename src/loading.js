
export class loading{
  constructor(){
    this.targetId = "loading-Element";
    this.targetEle = document.getElementById(this.targetId);
    this.loadingEle = null;
  }

  _drawingElement(){
    this.targetEle.classList.add('relativeElement');
    this.loadingEle = document.createElement('div');
    this.loadingEle.classList.add('loading-element');

    const innerHtml = `
      <div class="fixed-element">
        <div class="loader">Loading...</div>
        <div class="loader-info">데이터 준비중</div>
      </div>
      <style>
        .relativeElement{
          position:relative;
        }

        .loading-element{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex;background:rgba(247,247,247,0.96)}
        .loading-element .fixed-element{
          width: 100%;
          text-align: center;
          font-size: 12px;
          color: #fff;          
          display: flex;
          flex-wrap: wrap;
          align-content: center;
        }
        .loading-element .loader-info{
          display:block;
          width:100%;
          font-size:12px;
          color:#999999;
        }
        .loading-element .loader,
        .loading-element .loader:before,
        .loading-element .loader:after {
          border-radius: 50%;
          width: 8px;
          height: 8px;
          -webkit-animation-fill-mode: both;
          animation-fill-mode: both;
          -webkit-animation: load7 1.8s infinite ease-in-out;
          animation: load7 1.8s infinite ease-in-out;
        }
        .loading-element .loader {
          color: #1EB29A;
          font-size: 10px;
          margin:0 auto 40px;
          position: relative;
          text-indent: -9999em;
          -webkit-transform: translateZ(0);
          -ms-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-animation-delay: -0.16s;
          animation-delay: -0.16s;
        }
        .loading-element .loader:before,
        .loading-element .loader:after {
          content: '';
          position: absolute;
          top: 0;
        }
        .loading-element .loader:before {
          left: -20px;
          -webkit-animation-delay: -0.32s;
          animation-delay: -0.32s;
        }
        .loading-element .loader:after {
          left: 20px;
        }
        @-webkit-keyframes load7 {
          0%,
          80%,
          100% {
            box-shadow: 0 2.5em 0 -1.3em;
          }
          40% {
            box-shadow: 0 2.5em 0 0;
          }
        }
        @keyframes load7 {
          0%,
          80%,
          100% {
            box-shadow: 0 2.5em 0 -1.3em;
          }
          40% {
            box-shadow: 0 2.5em 0 0;
          }
        }
      </style>
    `;

    this.loadingEle.innerHTML = innerHtml
    this.targetEle.appendChild(this.loadingEle);
  }

  show(target){
    if(target){
      this.targetId = target;
      this.targetEle = document.getElementById(target);
    }

    this._drawingElement();
  }

  remove(target){
    if(target){
      this.targetId = target;
      this.targetEle = document.getElementById(target);
    }

    this.loadingEle.remove();
  }
}