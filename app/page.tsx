import Link from "next/link";
import { TerminalCursor } from "@/components/ui/TerminalCursor";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="z-10 max-w-4xl w-full">
        {/* ASCII Art Header */}
        <div className="text-center mb-8 flex justify-center">
          <pre className="text-terminal-green text-xs sm:text-sm font-mono whitespace-pre">
{`\`7MM"""YMM      \`7MM"""Yb.       \`7MMF'   \`7MF'    \`7MM"""YMM       .g8""8q.       \`7MM"""Mq.        .g8"""bgd      \`7MM"""YMM      
  MM    \`7        MM    \`Yb.       MM       M        MM    \`7     .dP'    \`YM.       MM   \`MM.     .dP'     \`M        MM    \`7      
  MM   d          MM     \`Mb       MM       M        MM   d       dM'      \`MM       MM   ,M9      dM'       \`        MM   d        
  MMmmMM          MM      MM       MM       M        MM""MM       MM        MM       MMmmdM9       MM                 MMmmMM        
  MM   Y  ,       MM     ,MP       MM       M        MM   Y       MM.      ,MP       MM  YM.       MM.    \`7MMF'      MM   Y  ,     
  MM     ,M       MM    ,dP'       YM.     ,M        MM           \`Mb.    ,dP'       MM   \`Mb.     \`Mb.     MM        MM     ,M     
.JMMmmmmMMM     .JMMmmmdP'          \`bmmmmd"'      .JMML.           \`"bmmd"'       .JMML. .JMM.      \`"bmmmdPY      .JMMmmmmMMM     `}
          </pre>
        </div>

        {/* Terminal Welcome Message */}
        <div className="terminal-card mb-8">
          <div className="terminal-prompt mb-4">
            <span className="text-terminal-green">$</span> cat welcome.txt
          </div>
          <div className="ml-4 space-y-2">
            <p className="text-terminal-info">
              # EduForge - AI-Powered Learning Platform
            </p>
            <p className="text-terminal-text">
              Transform any learning goal into a complete, adaptive learning experience.
            </p>
            <p className="text-terminal-success mt-4">
              ✓ AI-Generated Content
            </p>
            <p className="text-terminal-success">
              ✓ Adaptive Learning Paths
            </p>
            <p className="text-terminal-success">
              ✓ Interactive Quizzes & Worksheets
            </p>
            <p className="text-terminal-success">
              ✓ Progress Tracking
            </p>
          </div>
        </div>

        {/* Command Prompt */}
        <div className="terminal-card">
          <div className="terminal-prompt mb-4">
            <span className="text-terminal-green">$</span> select_action
          </div>
          <div className="ml-4 space-y-3">
            <Link
              href="/signin"
              className="terminal-button block text-center"
            >
              [1] Sign In
            </Link>
            <Link
              href="/signup"
              className="terminal-button block text-center"
            >
              [2] Sign Up
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-terminal-text text-xs opacity-70">
          <p>Type 'help' for more information</p>
          <p className="mt-2">
            <span className="text-terminal-green">eduforge@system</span>
            <span className="text-terminal-yellow">:</span>
            <span className="text-terminal-blue">~</span>
            <span className="text-terminal-green">$</span>
            <TerminalCursor />
          </p>
        </div>
      </div>
    </main>
  );
}

