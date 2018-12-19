{"version":3,"sources":["template.js"],"names":["BX","VoxImplant","sip","init","params","publicFolder","iframe","cloudTitle","cloudServer","cloudLogin","cloudPassword","cloudAuthUser","cloudOutboundProxy","cloudButton","officeTitle","officeServer","officeLogin","officePassword","officeButton","bind","attachCloudPbx","attachOfficePbx","ready","e","addClass","removeClass","style","display","ajax","url","method","data","sessid","bitrix_sessid","ACTION","PreventDefault","removeProperty","initHandlers","blockAjax","showWait","TYPE","TITLE","value","SERVER","LOGIN","PASSWORD","AUTH_USER","OUTBOUND_PROXY","VI_AJAX_CALL","dataType","timeout","onsuccess","delegate","ERROR","link","RESULT","location","href","closeWait","alert","split","join","this","onfailure","connectModule","confirm","message","replace","window","open","unlinkPhone","id","VI_DELETE","CONFIG_ID","elements","findChildren","className","length","reload","remove","showAdditionalFields","document","querySelector","addEventListener"],"mappings":"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","file":""}