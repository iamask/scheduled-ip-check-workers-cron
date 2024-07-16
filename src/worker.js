export default {
	async scheduled(event, env, ctx) {
	  console.log("cron processed");
  
	  // Define the URLs and webhook URL
	  const url = "https://www.cloudflare.com/ips-v4";
	  const hookurl = "https://chat.googleapis.com/v1/spaces/AAAAaWQHvIM/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=gmcYczs8GQns_HUKnOJIkld_fOlMDIjLLki3TXB6lMw";
  
	  // Fetch and process IP data
	  const response = await fetch(url, { headers: { "content-type": "text/plain" } });
	  const ipList = await response.text();
	  console.log("downloaded ipcheck : " + ipList)
  
	  // Retrieve current IP list from KV
	  const currentIpList = await env.IPRANGES.get("iplist");
	  console.log("currentIpList.  :"  + currentIpList);

	  if (currentIpList === ipList) {
		console.log("No changes in IP list");
	  } else {
		console.log("IP list changed, updating KV and triggering webhook");
  
		// Update IP list in KV
		await env.IPRANGES.put("iplist", ipList);

		const cardMessage = {
			cards: [
			  {
				header: {
				  title: 'New Message',
				  subtitle: 'From: Workers || IPlist changed'
				},
				sections: [
				  {
					widgets: [
					  {
						textParagraph: {
						  text: ipList
						}
					  }
					]
				  }
				]
			  }
			]
		  };

		
  
		// Trigger webhook
		const webhookOptions = {
		  method: "POST",
		  headers: {
			"content-type": "text/json",
		  },
		  body: JSON.stringify(cardMessage)
		};
		const webhookResponse = await fetch(hookurl, webhookOptions);
		const webhookResult = await webhookResponse.text();
		console.log("Webhook triggered:", webhookResult);
	  }
	},
  };
  