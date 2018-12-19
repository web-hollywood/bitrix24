{"version":3,"sources":["socialnetwork.js"],"names":["BX","namespace","Tasks","Integration","Socialnetwork","dataCache","dataFetchingInProgress","popupOpenedId","NetworkSelector","Util","Widget","extend","sys","code","options","mode","query","useSearch","useAdd","popupOffsetTop","popupOffsetLeft","syncLast","lastSelectedContext","methods","construct","this","callConstruct","ReferenceError","vars","snldId","intendSearch","last","intendOpen","changed","initialize","dialogInitialized","fireInitEvent","fetchDestinationData","initializeDialog","open","SocNetLogDestination","openDialog","close","closeDialog","addLast","entity","id","entityId","type","getEntityType","deleteLast","updateLast","option","items","result","i","k","hasOwnProperty","push","getQuery","add","context","execute","instances","Query","autoExec","bindEvent","delegate","onQueryExecuted","success","data","SUCCESS","RESULT","onSelectDestination","params","extranet","isExtranet","crmemail","isCrmEmail","email","isEmail","network","isNetwork","fireEvent","entityType","networkId","nameFormatted","name","description","desc","avatar","lastName","found","toString","trim","match","onUnSelectDestination","onOpenDialogDestination","onCloseDialogDestination","onOpenSearchDestination","onCloseSearchDestination","onOpenEmailDestination","onCloseEmailDestination","checkIsOpened","deselectItem","u","deleteItem","checkEntityId","selectItem","substring","util","hashCode","Math","random","scope","inputName","input","control","adjust","attrs","modeAll","modeUser","modeGroup","parameters","searchInput","bindMainPopup","node","offsetTop","parseInt","offsetLeft","bindSearchPopup","sendAjaxSearch","SONETGROUPS_LIMITED","useClientDatabase","allowUserSearch","allowSonetGroupsAjaxSearch","enableProjects","departmentSelectDisable","allowAddUser","CAN_ADD_MAIL_USERS","allowAddSocNetGroup","callback","select","proxy","unSelect","openSearch","closeSearch","openEmailAdd","closeEmailAdd","showSearchInput","bindOptions","position","forceTop","users","USERS","emails","EMAILS","groups","department","DEPARTMENT","departmentRelation","DEPARTMENT_RELATION","sonetgroups","SONETGROUPS","projects","PROJECTS","itemsLast","LAST","itemsSelected","SELECTED","allowSearchNetworkUsers","NETWORK_ENABLED","showVacations","SHOW_VACATIONS","usersVacation","USERS_VACATION","allowSearchEmailUsers","init","formName","sendAjax","paramsPaste","clone","onPasteEvent","bind","BXfpSearch","BXfpSearchBefore","defer","clearDataCache"],"mappings":"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","file":""}