# function to download the iamges
@asyncCircuitBreaker
async def download_image(image_url, filename):
    async with aiohttp.ClientSession() as session:
        async with session.get(image_url) as response:
            if response.status == 200:
                content = await response.read()
                with open(f'{filename}.jpg', 'wb') as file:
                    file.write(content)
                print(f'Download Completed: {filename}.jpg')
            else:
                print(f'Failed to download {filename}.jpg')    
    return filename


@asyncCircuitBreaker
# Wrap synchronous pollinations code
async def generate_image_async(description, title):
    model_obj = pollinationsAi.Model()
    image = await sync_to_async(model_obj.generate)(
        prompt=f'{description} {pollinationsAi.realistic}',
        model=pollinationsAi.flux,
        width=1024,
        height=1024,
        seed=42
    )
    await sync_to_async(image.save)(f'{title}.jpg')
    return image.url

@asyncCircuitBreaker
async def RequestCreateImagesFunc(prompt,email,SocialMediaType):
    """Generate AI images content asynchronously."""
    try:
        i = 0
        tasks = []  # Store tasks for concurrent execution
        for items in prompt:
            if SocialMediaType == 'youtube':
                snippet = items.get("snippet", {})  # Get snippet dictionary safely
            elif SocialMediaType == 'tiktok':
                snippet = items.get("post_info", {})  # Get post_info safely

            title = snippet.get("title", f'{i}_{email}')  # Fallback title  
            # Image details
            ImageDescription = snippet.get("description", "A beautiful natural scene")
            width = 1024
            height = 1024
            seed = 42 # Each seed generates a new image variation
            model = 'flux' # Using 'flux' as default if model is not provided

            image_url = f"https://pollinations.ai/p/{ImageDescription}?width={width}&height={height}&seed={seed}&model={model}"
            
            # Add async task for downloading image
            tasks.append(download_image(image_url, title))
            # Using the pollinations pypi package           

            model_obj = pollinationsAi.Model()

            image = model_obj.generate(
                prompt=f'{ImageDescription} {pollinationsAi.realistic}',
                model=pollinationsAi.flux,
                width=1024,
                height=1024,
                seed=42
            )
            image.save(f'{title}.jpg')

            print(image.url)
            i += 1
       
        reponseval = {'type' : 'success','status' : 'success','result' : ''}
        return reponseval
    except Exception as e:
        print(e)
        reponseval = {'type' : 'error','status' : 'error','result' : 'It seams there is an issue with your request. Try again later'}
        return reponseval
    

netstat -ano | findstr :8080
taskkill /PID <PID> /F