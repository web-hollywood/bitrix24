<?php

CBitrixComponent::includeComponentClass("bitrix:imconnector.facebook");

class ImConnectorFacebookComments extends ImConnectorFacebook
{
	protected $connector = 'facebookcomments';

	protected $pageId = 'page_fbcomm';
};