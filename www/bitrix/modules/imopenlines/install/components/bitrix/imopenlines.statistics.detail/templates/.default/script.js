BX.ready(function(){
	BX.PULL.extendWatch('IMOL_STATISTICS');
	
	BX.addCustomEvent("onPullEvent-imopenlines", function(command,params) {
		if (command == 'voteHead')
		{
			var placeholder = BX("ol-vote-head-placeholder-"+params.sessionId);
			if (placeholder)
			{
				BX.cleanNode(placeholder);
				placeholder.appendChild(
					BX.MessengerCommon.linesVoteHeadNodes(params.sessionId, params.voteValue, true)
				);
			}
		}
	});
	
});

