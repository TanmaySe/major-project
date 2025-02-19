
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
            utility:getListsFromBoard,
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
    router.push(`https://trello.com/1/authorize?expiration=1day&scope=read,account&response_type=token&key=${trelloApiKey}&return_url=http://localhost:3000/workspace/${projectId}`)
}

export const getListsFromBoard = async(trelloApiKey,boardId,token,setMessages) => {
    const response = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${trelloApiKey}&token=${token}`)
    if(!response.ok) {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Something went wrong'}]);
    }
    else {
        const data = await response.json()
        const filteredData = data.map(item => ({
            listId:item.id,
            listName:item.name,
            button:true,
            sender:'ai',
            utilityText:'getCardsFromList',
            utility:getCardsFromList
        }))
        console.log(data)
        setMessages((prev) => {
            const newMessages = [...prev, ...filteredData];
            return newMessages;
        })
    }
}

export const getCardsFromList = async(trelloApiKey,token,listId,setMessages) => {
    const response = await fetch(`https://api.trello.com/1/lists/${listId}/cards?key=${trelloApiKey}&token=${token}`)
    if(!response.ok) {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Something went wrong'}]);
        return;
    }
    if (!response.ok) {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Something went wrong' }]);
        return;
    }

    const data = await response.json();
    const getMemberDetails = async (idMembers) => {
        const memberPromises = idMembers.map(async (memberId) => {
            try {
                const res = await fetch(`https://api.trello.com/1/members/${memberId}?key=${trelloApiKey}&token=${token}&fields=fullName,email,avatarUrl`);
                const memberData = await res.json();
                return {
                    name: memberData.fullName || null,
                    email: memberData.email || null,
                    avatar: memberData.avatarHash 
                    ? `https://trello-avatars.s3.amazonaws.com/${memberData.avatarHash}/170.png`
                    : `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y`
                };
            } catch (error) {
                console.error(`Error fetching details for ${memberId}:`, error);
                return {
                    name: null,
                    email: null,
                    avatar: null,
                };
            }
        });

        return Promise.all(memberPromises); // Resolve all promises
    };

    // Process each card and fetch member details
    const processedData = await Promise.all(data.map(async (item) => {
        const members = await getMemberDetails(item.idMembers); // Fetch member details
        return {
            cardId: item.id,
            cardName: item.name,
            cardDesc: item.desc,
            cardDeadline: item.due,
            redirect: item.shortUrl,
            members, // Store member details as an array
            button: true,
            sender: 'ai',
            utilityText: 'cards',
        };
    }));

    console.log(processedData);

    setMessages((prev) => [...prev, ...processedData]);
    
}

export const createTaskFromTrello = async(cardName,cardDesc,cardDeadline,priority,members,projectId,setMessages,category) => {
    const emails = members.map(member => member.email);
    const response = await fetch(`/api/projects/${projectId}/task`,{
        method:'POST',
        headers:{
            "Content-Type":'application/json'
        },
        body:JSON.stringify({
            task:cardName,
            description:cardDesc,
            deadline:cardDeadline,
            priority:priority,
            category,
            assigned:emails
        })
    })
    if(!response.ok) {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Something went wrong' }]);
    }
    else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Task added successfully' }]);
    }
}