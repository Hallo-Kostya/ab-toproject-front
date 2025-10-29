export function formatShortName(firstName: string, lastName: string): string {
    const lastNameInitial = lastName.charAt(0).toUpperCase() + ".";
    
    return `${firstName} ${lastNameInitial}`;
}