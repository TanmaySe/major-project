'use client'

export const getBoards = async(trelloApiKey,token,setMessages,messages) => {
    const response = await fetch(`https://api.trello.com/1/members/me/boards?key=${trelloApiKey}&token=${token}`)
    if(!response.ok) {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Something went wrong'}]);
    }
    else {
        const data = await response.json()
        const filteredData = data.map(item => ({
            boardId:item.id,
            boardName:item.name,
            button:true,
            sender:'ai',
            utilityText:'getListsFromBoard',
            desc:item.desc,
            bgImage:item.prefs.sharedSourceUrl
        }))
        console.log(data)
        setMessages((prev) => {
            const newMessages = [...prev, ...filteredData];
            return newMessages;
        })
    }
}

export const handleTrelloAuth = async(trelloApiKey,projectId,router) => {
    router.push(`https://trello.com/1/authorize?expiration=1day&scope=read&response_type=token&key=${trelloApiKey}&return_url=http://localhost:3000/workspace/${projectId}`)

}