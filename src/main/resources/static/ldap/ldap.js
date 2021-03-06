Ext.onReady(function () {
  // Ext.tip.QuickTipManager.init();

  var reload = function () {
    userStore.load();
  };

  var userStore = Ext.create('MyExt.Component.SimpleJsonStore', {
    dataUrl: '../ldap/searchLdapUser.do',
    rootFlag: 'data',
    pageSize: 200,
    fields: ['id', 'externalId', 'userName', 'displayName', 'firstName', 'lastName', 'email']
  });

  userStore.on('beforeload', function (store, options) {
    options.params = Ext.apply(options.params || {}, searchForm.getForm().getValues());
  });

  var searchForm = Ext.create('Ext.form.Panel', {
    region: 'north',
    frame: true,
    height: 100,
    bodyStyle: 'padding:15px 0px 0px 10px',
    fieldDefaults: {
      labelWidth: 80
    },
    defaults: {
      width: 300
    },
    defaultType: 'textfield',
    buttonAlign: 'left',
    items: [{
      fieldLabel: 'LDAP filter',
      width: 600,
      emptyText: '(objectClass=user)',
      name: 'ldapfilter',
      enableKeyEvents: true,
      listeners: {
        keypress: function (thiz, e) {
          if (e.getKey() == Ext.EventObject.ENTER) {
            userGrid.getPageToolbar().moveFirst();
          }
        }
      }
    }, {
      fieldLabel: 'LDAP base',
      width: 600,
      emptyText: 'ou=hangzhou,dc=test,dc=com',
      name: 'ldapbase',
      enableKeyEvents: true,
      listeners: {
        keypress: function (thiz, e) {
          if (e.getKey() == Ext.EventObject.ENTER) {
            userGrid.getPageToolbar().moveFirst();
          }
        }
      }
    }]
  });


  var userGrid = Ext.create('MyExt.Component.GridPanel', {
    region: 'center',
    title: '用户列表',
    hasInfoBbar: true,
    hasBbar: false,
    store: userStore,
    columns: [{
      dataIndex: 'id',
      header: 'ID',
      width: 200
    }, {
      dataIndex: 'id',
      header: "同步",
      width: 50,
      align: 'center',
      renderer: function (value) {
        if (value && value != "") {
          return '<img src="https://ichengchao.oss-cn-hangzhou.aliyuncs.com/static/image/icon/safe.png" />';
        } else {
          return "";
        }
      }
    }, {
      dataIndex: 'firstName',
      header: "firstName",
      width: 150,
    }, {
      dataIndex: 'lastName',
      header: "lastName",
      width: 150
    }, {
      dataIndex: 'externalId',
      header: 'externalId',
      width: 120
    }, {
      dataIndex: 'email',
      header: "邮箱",
      flex: 1
    }],
    tbar: [{
      text: '同步到cloudsso',
      iconCls: 'MyExt-refresh',
      handler: function () {
        var select = MyExt.util.SelectGridModel(userGrid, false);
        if (!select) {
          return;
        }
        let emailArray = new Array();
        for (let i = 0; i < select.length; i++) {
          emailArray[i] = select[i].data["email"];
        }
        MyExt.util.MessageConfirm('是否确定同步', function () {
          MyExt.util.Ajax('../ldap/syncUser.do', {
            emails: Ext.JSON.encode(emailArray),
            ldapbase: searchForm.getForm().getValues()["ldapbase"],
            ldapfilter: searchForm.getForm().getValues()["ldapfilter"]
          }, function (data) {
            reload();
            MyExt.Msg.alert('同步成功!');
          });
        });
      }
    }]
  });

  Ext.create('Ext.container.Viewport', {
    layout: 'border',
    items: [searchForm, userGrid]
  });
  reload();

})