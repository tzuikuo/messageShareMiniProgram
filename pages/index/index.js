//index.js
const util = require("../../utils/util");
//实现函数
const db = wx.cloud.database().collection("test");
Page({
  data: {
    inputString: "",//留言框内的数据
    msgHistory: [],//历史留言数据
    msgShow:[],
    curPage:1,
    pageSize:5,
    totalCurPage:0,
    forwardTime: "0000/00/00 00:00:00"
  },
  changeInputVal(ev) {
    this.setData({
      inputString: ev.detail.value//将留言框的数据存储到inputString中，方便添加留言时获取
    });
  },
  addMsg() {
    var that=this;
    var time = util.formatTime(new Date());
    db.add({
      //要添加的数据
      data:{
        message : this.data.inputString,
        //timestamp: Date.now()
        forwardTime: time
      },
      //添加成功时的操作
      success(res){
        wx.showToast({
          title: '发布成功！',
          icon: 'success',
          duration: 500
        })
        var list = that.data.msgHistory;//获取所有留言
        list.reverse();
        list.push({//向list中添加当前添加的留言
          message: that.data.inputString,
          _id: res._id,
          forwardTime: time
        });
        list.reverse();
        var temp=Math.ceil(that.data.msgHistory.length/that.data.pageSize);
        var listShow=[];
        for(var i=0;i<that.data.pageSize;i++){
          if(i>=that.data.msgHistory.length) break;
          var cur=that.data.msgHistory[i];
          listShow.push({"message":cur.message,"_id":cur._id,"forwardTime":cur.forwardTime});
        }
        that.setData({//将所有留言更新到msgHistory中。
          msgHistory: list,
          curPage: 1,
          totalCurPage: temp,
          msgShow: listShow,
          inputString: ""//清空留言框内的内容
        });
      },
      fail(res){
        wx.showToast({
          title: '发布失败！',
          icon: 'error',
          duration: 500
        })
      },
    })
  },
  deleMsg(ev) {
    var list=this.data.msgHistory;
    var n = ev.target.dataset.index;//获取当前留言的index
    var that=this;
    wx.showModal({
      title: '删除当前条目',
      content: '确认删除该项吗？',
      success: function (resnew) {
        if (resnew.confirm) {  
          db.doc(list[n]._id).remove({
            success: function(res) {
              list.splice(n, 1);//删除索引号为n的数据
              var temp=Math.ceil(that.data.msgHistory.length/that.data.pageSize);
              var listShow=[];
              for(var i=0;i<that.data.pageSize;i++){
                if(i>=that.data.msgHistory.length) break;
                var cur=that.data.msgHistory[i];
                listShow.push({"message":cur.message,"_id":cur._id,"forwardTime":cur.forwardTime});
              }
              that.setData({//将所有留言更新到msgHistory中。
                msgHistory: list,
                curPage: 1,
                totalCurPage: temp,
                msgShow: listShow
              });
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 500
              })
            },
            fail(res){
              wx.showToast({
                title: '没有权限！',
                icon: 'error',
                duration: 500
              })
            },
          })
        }
      }
    })
  },
  lastPage() {
    if(this.data.curPage==1){
      wx.showToast({
        title: '到顶了',
        icon: 'success',
        duration: 500
      })
    }
    else{
      this.data.curPage-=1;
      var listShow=[];
      var startIndex=(this.data.curPage-1)*this.data.pageSize;
      var endIndex=this.data.curPage*this.data.pageSize;
      for(var i=startIndex;i<endIndex;i++){
        if(i>=this.data.msgHistory.length) break;
        var cur=this.data.msgHistory[i];
        listShow.push({"message":cur.message,"_id":cur._id,"forwardTime":cur.forwardTime});
      }
      this.setData({//将所有留言更新到msgShow中。
        msgShow: listShow
      });
    }
  },
  nextPage() {
    if(this.data.curPage==this.data.totalCurPage||this.data.totalCurPage==0){
      wx.showToast({
        title: '到底了',
        icon: 'success',
        duration: 500
      })
    }
    else{
      this.data.curPage+=1;
      var listShow=[];
      var startIndex=(this.data.curPage-1)*this.data.pageSize;
      var endIndex=this.data.curPage*this.data.pageSize;
      for(var i=startIndex;i<endIndex;i++){
        if(i>=this.data.msgHistory.length) break;
        var cur=this.data.msgHistory[i];
        listShow.push({"message":cur.message,"_id":cur._id,"forwardTime":cur.forwardTime});
      }
      this.setData({//将所有留言更新到msgShow中。
        msgShow: listShow
      });
    }
  },
  onPullDownRefresh: function(){
    var that=this;
    db.get({
      success(res){
        console.log("数据库加载成功");
        var dbdata=res.data;
        var list=[];
        for(var i=0;i<dbdata.length;i++){
          var cur=dbdata[i];
          list.push({"message":cur.message,"_id":cur._id,"forwardTime":cur.forwardTime});
        }
        list.reverse();
        var temp=Math.ceil(that.data.msgHistory.length/that.data.pageSize);
        var listShow=[];
        for(var i=0;i<that.data.pageSize;i++){
          if(i>=that.data.msgHistory.length) break;
          var cur=that.data.msgHistory[i];
          listShow.push({"message":cur.message,"_id":cur._id,"forwardTime":cur.forwardTime});
        }
        that.setData({//将所有留言更新到msgHistory中。
          msgHistory: list,
          totalCurPage: temp,
          msgShow: listShow
        });
      },
      fail(res){
        wx.showToast({
          title: '数据库加载失败！',
          icon: 'error',
          duration: 500
        })
      },
    })
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    var that=this;
    db.get({
      success(res){
        console.log("数据库加载成功");
        var dbdata=res.data;
        var list=that.data.msgHistory;
        for(var i=0;i<dbdata.length;i++){
          var cur=dbdata[i];
          list.push({"message":cur.message,"_id":cur._id,"forwardTime":cur.forwardTime});
        }
        list.reverse();
        var temp=Math.ceil(that.data.msgHistory.length/that.data.pageSize);
        var listShow=[];
        for(var i=0;i<that.data.pageSize;i++){
          if(i>=that.data.msgHistory.length) break;
          var cur=that.data.msgHistory[i];
          listShow.push({"message":cur.message,"_id":cur._id,"forwardTime":cur.forwardTime});
        }
        that.setData({//将所有留言更新到msgHistory中。
          msgHistory: list,
          totalCurPage: temp,
          msgShow: listShow
        });
      },
      fail(res){
        wx.showToast({
          title: '数据库加载失败！',
          icon: 'error',
          duration: 500
        })
      },
    })
  },
})