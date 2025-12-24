"use client"

import { motion } from "framer-motion"

export function HeroSection() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                ease: [0.25, 0.1, 0.25, 1.0] as const,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1.0] as const,
            },
        },
    }

    const asciiArt = `              ...                            
             ;::::;                           
           ;::::; :;                          
         ;:::::'   :;                         
        ;:::::;     ;.                        
       ,:::::'       ;           OOO\\         
       ::::::;       ;          OOOOO\\        
       ;:::::;       ;         OOOOOOOO       
      ,;::::::;     ;'         / OOOOOOO      
    ;:::::::::'. ,,,;.        /  / DOOOOOO    
  .';:::::::::::::::::;,     /  /     DOOOO   
 ,::::::;::::::;;;;::::;,   /  /        DOOO  
;\`::::::\`'::::::;;;::::: ,#/  /          DOOO 
:\`:::::::\`;::::::;;::: ;::#  /            DOOO
::\`:::::::\`;:::::::: ;::::# /              DOO
\`:\`:::::::\`;:::::: ;::::::#/               DOO
 :::\`:::::::\`;; ;:::::::::##                OO
 ::::\`:::::::\`;::::::::;:::#                OO
 \`:::::\`::::::::::::;'\`:;::#                O 
  \`:::::\`::::::::;' /  / \`:#                  
   ::::::\`:::::;'  /  /   \`#`

    return (
        <section className="min-h-[50vh] flex items-center pt-20 md:pt-24 relative">
            <div className="absolute top-3 left-3 md:top-4 md:left-4 w-3 h-3 md:w-4 md:h-4 border-l border-t border-[#333]" />
            <div className="absolute top-3 right-3 md:top-4 md:right-4 w-3 h-3 md:w-4 md:h-4 border-r border-t border-[#333]" />

            <div className="w-full px-4 md:px-8 flex items-center justify-between">
                <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <motion.h1 variants={itemVariants} className="text-large font-normal text-[#fafafa] mb-4 md:mb-6">
                        Mohammad Abbas
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-base text-[#a1a1a1] max-w-sm md:max-w-md leading-relaxed">
                        I'm a full stack developer who loves turning ideas into innovative software solutions. From concept to deployment, I focus on creating intuitive, efficient, and engaging applications. I enjoy exploring new technologies and finding creative ways to solve challenging problems.
                    </motion.p>
                </motion.div>

                <pre className="font-mono text-xs md:text-sm text-[#555] whitespace-pre leading-none hidden md:block">
                    {asciiArt}
                </pre>
            </div>
        </section>
    )
}
