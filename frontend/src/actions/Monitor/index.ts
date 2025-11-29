export const GetFileSystems = async (): Promise<any|string> => {

		const res = await fetch("/action?a=GetFileSystems", {method:"POST", body: JSON.stringify({})})

		const data = (await res.json())

		return data

		}
export const GetHostname = async (): Promise<string|string> => {

		const res = await fetch("/action?a=GetHostname", {method:"POST", body: JSON.stringify({})})

		const data = (await res.json())

		return data

		}
export const GetSystemProcesses = async (): Promise<any|string> => {

		const res = await fetch("/action?a=GetSystemProcesses", {method:"POST", body: JSON.stringify({})})

		const data = (await res.json())

		return data

		}
export const GetSystemResources = async (): Promise<any|string> => {

		const res = await fetch("/action?a=GetSystemResources", {method:"POST", body: JSON.stringify({})})

		const data = (await res.json())

		return data

		}