import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles.module.css';
import { useLocation } from 'react-router-dom';
import { PaperPlaneRight, Copy, Check, Link, Trash, Book, User } from '@phosphor-icons/react';
import { useMetadata } from '../../context/MetadataContext';

interface Comment {
  id: string;
  text: string;
  selection: {
    text: string;
    startOffset: number;
    endOffset: number;
  };
  timestamp: number;
}

interface TextSelectorProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

export function TextSelector({ 
  isVisible, 
  setIsVisible
}: TextSelectorProps): JSX.Element {
  const location = useLocation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedText, setSelectedText] = useState<{
    text: string;
    startOffset: number;
    endOffset: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { title: pageTitle } = useMetadata();
  const [showToast, setShowToast] = useState(false);
  const [isFaded, setIsFaded] = useState(false);
  const fadeTimeoutRef = useRef<NodeJS.Timeout>();

  // Create a stable reference to setIsVisible
  const setIsVisibleRef = useRef(setIsVisible);

  // Keep the ref up to date
  useEffect(() => {
    setIsVisibleRef.current = setIsVisible;
  }, [setIsVisible]);

  // Function to clear all highlights
  const clearHighlights = useCallback(() => {
    document.querySelectorAll(`.${styles.highlightedSelection}`).forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        const text = el.textContent || '';
        parent.replaceChild(document.createTextNode(text), el);
        parent.normalize(); // Merge adjacent text nodes
      }
    });
  }, []);

  // Move findAndHighlightText before handleMouseSelection
  const findAndHighlightText = useCallback((container: Element, searchText: string, start?: number, end?: number) => {
    try {
      clearHighlights();

      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
      );

      let currentPos = 0;
      let nodes: { node: Node; start: number; end: number }[] = [];
      let node;

      // First pass: map all nodes and their positions
      while ((node = walker.nextNode())) {
        const length = node.textContent?.length || 0;
        if (length > 0) {
          nodes.push({
            node,
            start: currentPos,
            end: currentPos + length
          });
          currentPos += length;
        }
      }

      // Find all nodes that intersect with our selection
      const affectedNodes = nodes.filter(({ start: nodeStart, end: nodeEnd }) => {
        return (start! <= nodeEnd && end! > nodeStart);
      });

      if (affectedNodes.length === 0) return false;

      // Create highlights for each affected node
      affectedNodes.forEach(({ node, start: nodeStart, end: nodeEnd }) => {
        const range = document.createRange();
        
        // Calculate correct offsets for this node
        const startOffset = Math.max(0, start! - nodeStart);
        const endOffset = Math.min(node.textContent?.length || 0, end! - nodeStart);

        if (startOffset < endOffset) {
          range.setStart(node, startOffset);
          range.setEnd(node, endOffset);

          const span = document.createElement('span');
          span.className = styles.highlightedSelection;
          
          try {
            range.surroundContents(span);
          } catch (e) {
            console.warn('Could not surround range:', e);
          }
        }
      });

      // Scroll to the first highlight
      const highlight = container.querySelector(`.${styles.highlightedSelection}`);
      if (highlight) {
        setTimeout(() => {
          highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Failed to highlight text:', err);
      return false;
    }
  }, [clearHighlights]);

  // Now handleMouseSelection can use findAndHighlightText
  const handleMouseSelection = useCallback((e: MouseEvent) => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const text = selection.toString().trim();
      if (!text) return;

      // Skip if clicking inside the notes panel
      const target = e.target as HTMLElement;
      if (target.closest(`.${styles.commentsList}`)) return;

      const container = document.querySelector('.theme-doc-markdown');
      if (!container) return;

      // Get the exact range
      const range = selection.getRangeAt(0);
      const exactText = range.toString();

      // Calculate positions using accumulated text length
      let accumulator = '';
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
      );

      let startPos = 0;
      let endPos = 0;
      let node;

      // First pass: find start position
      while ((node = walker.nextNode())) {
        if (node === range.startContainer) {
          startPos = accumulator.length + range.startOffset;
        }
        if (node === range.endContainer) {
          endPos = accumulator.length + range.endOffset;
          break;
        }
        accumulator += node.textContent || '';
      }

      // Create the comment with the exact selected text
      const newComment: Comment = {
        id: Date.now().toString(),
        text: '',
        selection: {
          text: exactText,
          startOffset: startPos,
          endOffset: endPos,
        },
        timestamp: Date.now(),
      };

      // Clear existing highlights first
      clearHighlights();
      
      // Create the highlight using the exact text and positions
      const highlighted = findAndHighlightText(
        container,
        exactText,
        startPos,
        endPos
      );

      if (highlighted) {
        setComments(prevComments => {
          const updatedComments = [...prevComments, newComment];
          localStorage.setItem(`comments-${location.pathname}`, JSON.stringify(updatedComments));
          return updatedComments;
        });

        setSelectedText({
          text: exactText,
          startOffset: startPos,
          endOffset: endPos,
        });
        
        setNewMessage('');
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to handle selection:', error);
    }
  }, [clearHighlights, findAndHighlightText, location.pathname, setIsVisible]);

  const handleTouchSelection = useCallback((e: TouchEvent) => {
    // Same logic as handleMouseSelection
    handleMouseSelection(e as unknown as MouseEvent);
  }, [handleMouseSelection]);

  // Separate event listeners for mouse and touch
  useEffect(() => {
    const mouseUpHandler = (e: MouseEvent) => {
      // Increased delay to ensure selection is complete
      setTimeout(() => handleMouseSelection(e), 50);
    };

    if (!('ontouchstart' in window)) {
      document.addEventListener('mouseup', mouseUpHandler);
      return () => document.removeEventListener('mouseup', mouseUpHandler);
    }
  }, [handleMouseSelection]);

  useEffect(() => {
    const touchEndHandler = (e: TouchEvent) => {
      // Prevent default to avoid unwanted interactions
      e.preventDefault();
      
      // Increased delay for more reliable touch selection
      setTimeout(() => handleTouchSelection(e), 500);
    };

    if ('ontouchstart' in window) {
      document.addEventListener('touchend', touchEndHandler, { passive: false });
      return () => document.removeEventListener('touchend', touchEndHandler);
    }
  }, [handleTouchSelection]);

  // Update scrollToText to use the common function
  const scrollToText = useCallback((comment: Comment) => {
    const container = document.querySelector('.theme-doc-markdown');
    if (!container) return;

    // On mobile, dismiss the notes panel immediately
    if (window.innerWidth <= 768) {
      setIsVisible(false);
    }

    // Use the stored offsets instead of searching for text
    findAndHighlightText(
      container, 
      '', // Empty string since we're using offsets
      comment.selection.startOffset,
      comment.selection.endOffset
    );
  }, [findAndHighlightText, setIsVisible]);

  // Function to handle comment deletion
  const handleDeleteComment = useCallback((commentId: string) => {
    // Clear the specific highlight before removing the comment
    const commentToDelete = comments.find(c => c.id === commentId);
    if (commentToDelete?.selection.text) {
      const highlightElements = Array.from(document.querySelectorAll(`.${styles.highlightedSelection}`));
      highlightElements.forEach(el => {
        if (el.textContent === commentToDelete.selection.text) {
          const parent = el.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent || ''), el);
          }
        }
      });
    }

    // Remove the comment from state
    setComments(prevComments => {
      const updatedComments = prevComments.filter(comment => comment.id !== commentId);
      localStorage.setItem(`comments-${location.pathname}`, JSON.stringify(updatedComments));
      return updatedComments;
    });
  }, [comments, location.pathname]);

  // Function to clear all comments
  const handleClearAll = useCallback(() => {
    setComments([]);
    localStorage.setItem(`comments-${location.pathname}`, JSON.stringify([]));
  }, [location.pathname]);

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Function to handle sending messages
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    setComments(prevComments => {
      let updatedComments;
      if (selectedText) {
        // Find the most recent comment with matching selection
        const index = prevComments.findIndex(c => 
          c.selection.text === selectedText.text &&
          c.selection.startOffset === selectedText.startOffset &&
          c.selection.endOffset === selectedText.endOffset &&
          !c.text // Only update if there's no existing reply
        );
        
        if (index !== -1) {
          // Update existing comment with the reply
          updatedComments = [...prevComments];
          updatedComments[index] = {
            ...updatedComments[index],
            text: newMessage.trim(),
          };
        } else {
          // Create a new comment if no matching selection found
          updatedComments = [...prevComments, {
            id: Date.now().toString(),
            text: newMessage.trim(),
            selection: selectedText,
            timestamp: Date.now(),
          }];
        }
      } else {
        // Create a new comment without selection (just a note)
        updatedComments = [...prevComments, {
          id: Date.now().toString(),
          text: newMessage.trim(),
          selection: { text: '', startOffset: 0, endOffset: 0 },
          timestamp: Date.now(),
        }];
      }

      localStorage.setItem(`comments-${location.pathname}`, JSON.stringify(updatedComments));
      return updatedComments;
    });

    setNewMessage('');
    setSelectedText(null);
    clearHighlights();
    
    setTimeout(scrollToBottom, 100);
  }, [newMessage, selectedText, location.pathname, clearHighlights, scrollToBottom]);

  // Load comments effect - update to include forceUpdate
  useEffect(() => {
    const savedComments = localStorage.getItem(`comments-${location.pathname}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      setComments([]);
    }
  }, [location.pathname, forceUpdate]);

  // Force re-render when comments change
  useEffect(() => {
    if (comments.length > 0) {
      scrollToBottom();
    }
  }, [comments, scrollToBottom]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    // If today
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    
    // If yesterday
    if (diffInDays === 1) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    // If within last 7 days
    if (diffInDays < 7) {
      return `${date.toLocaleDateString([], { weekday: 'long' })} ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    // If this year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // If different year
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Update handleShowNotes to clear highlights when closing
  const handleCloseNotes = useCallback(() => {
    clearHighlights();
    setIsVisible(false);
  }, [clearHighlights, setIsVisible]);

  // Add clearAll function
  const clearAll = useCallback(() => {
    clearHighlights();
    setComments([]);
    localStorage.removeItem(`comments-${location.pathname}`);
  }, [clearHighlights, location.pathname]);

  // Update CSS for better mobile support
  const mobileStyles = `
    @media (max-width: 768px) {
      * {
        -webkit-touch-callout: none;
        -webkit-user-select: text;
        user-select: text;
      }

      .theme-doc-markdown {
        -webkit-user-select: text;
        user-select: text;
      }

      .commentsList {
        width: 100%;
        height: 60vh;
        bottom: 0;
        right: 0;
        border-radius: 12px 12px 0 0;
        -webkit-transform: translateZ(0);
      }
    }
  `;

  // Add at the beginning of your component
  useEffect(() => {
    const updateVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateVH(); // Set initial value
    
    window.addEventListener('resize', updateVH);
    window.addEventListener('orientationchange', updateVH);
    
    // For iOS Safari
    window.visualViewport?.addEventListener('resize', updateVH);

    return () => {
      window.removeEventListener('resize', updateVH);
      window.removeEventListener('orientationchange', updateVH);
      window.visualViewport?.removeEventListener('resize', updateVH);
    };
  }, []);

  // Update the viewport meta tag
  useEffect(() => {
    const viewport = document.querySelector('meta[name=viewport]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover';
      document.head.appendChild(meta);
    } else {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover');
    }
  }, []);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't clear if clicking inside notes panel
      if (target.closest(`.${styles.commentsList}`)) return;
      
      // Don't clear if clicking on a highlighted selection
      if (target.closest(`.${styles.highlightedSelection}`)) return;
      
      // Don't clear if making a new selection
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) return;

      // Clear highlights and selection state
      clearHighlights();
      setSelectedText(null);
    };

    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [clearHighlights]);

  // Add touch event cleanup when component unmounts
  useEffect(() => {
    return () => {
      clearHighlights();
    };
  }, [clearHighlights]);

  const getTextPosition = (node: Node, container: Element): number => {
    let position = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode;
    while ((currentNode = walker.nextNode())) {
      if (currentNode === node) {
        return position;
      }
      // Only count text nodes that are not empty
      if (currentNode.textContent?.trim()) {
        position += currentNode.textContent.length;
      }
    }

    return position;
  };

  const createQuoteLink = useCallback((comment: Comment) => {
    const container = document.querySelector('.theme-doc-markdown');
    if (!container) return '';

    // Build text position map
    let position = 0;
    const textNodes: { node: Node; start: number; end: number }[] = [];
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while ((node = walker.nextNode())) {
      // Only include non-empty text nodes
      if (node.textContent?.trim()) {
        const length = node.textContent.length;
        textNodes.push({
          node,
          start: position,
          end: position + length
        });
        position += length;
      }
    }

    // Validate the positions
    const startPos = comment.selection.startOffset;
    const endPos = comment.selection.endOffset;
    
    if (startPos < 0 || endPos > position) {
      console.error('Invalid text position:', {
        startPos,
        endPos,
        textLength: position,
        expectedText: comment.selection.text,
        actualText: textNodes
          .filter(n => n.start >= startPos && n.end <= endPos)
          .map(n => n.node.textContent)
          .join('')
      });
      return '';
    }

    const baseUrl = window.location.origin;
    const path = location.pathname;
    return `${baseUrl}${path}?start=${startPos}&end=${endPos}`;
  }, [location.pathname]);

  const getBookDetails = useCallback(() => {
    // Try to get author from header
    const authorElement = document.querySelector('.author_MmLr');
    const author = authorElement?.textContent?.replace('By ', '') || '';

    // Get breadcrumbs and handle the logic for proper title selection
    const breadcrumbs = Array.from(document.querySelectorAll('.breadcrumbs__link'));
    let bookTitle = '';
    
    if (breadcrumbs.length === 2) {
      // If only two breadcrumbs, use the last one
      bookTitle = breadcrumbs[breadcrumbs.length - 1]?.textContent || '';
    } else if (breadcrumbs.length > 2) {
      // If more than two breadcrumbs, use the second to last one
      bookTitle = breadcrumbs[breadcrumbs.length - 2]?.textContent || '';
    }
    
    // Fallback to sidebar if breadcrumbs not found
    if (!bookTitle) {
      const sidebarLinks = document.querySelectorAll('.menu__link--active');
      bookTitle = sidebarLinks.length > 1 
        ? sidebarLinks[sidebarLinks.length - 2]?.textContent // Get parent menu item
        : null;
    }

    const title = bookTitle || pageTitle || 'the book';

    // Get cover image
    const coverImg = document.querySelector('.coverImage_nvWl') as HTMLImageElement;
    const coverUrl = coverImg?.src || '';

    return {
      author,
      title,
      coverUrl
    };
  }, [pageTitle]);

  const handleCopyQuote = async (comment: Comment, quoteOnly: boolean = false) => {
    try {
      const quoteLink = createQuoteLink(comment);
      const { author, title } = getBookDetails();
      let textToCopy = '';

      if (comment.selection.text) {
        textToCopy = `"${comment.selection.text}"\n`;
        textToCopy += `(an excerpt from ${title}${author ? ` by ${author}` : ''})\n`;
        
        if (!quoteOnly && comment.text) {
          textToCopy += `\nMy Reply: "${comment.text}"\n`;
        }
        
        textToCopy += `\nRead more at: ${quoteLink}`;
      } else {
        textToCopy = `Me: "${comment.text}"\n`;
        textToCopy += `From: ${title}${author ? ` by ${author}` : ''}\n${quoteLink}`;
      }
      
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(comment.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Update URL parameter handling
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const start = parseInt(params.get('start') || '');
    const end = parseInt(params.get('end') || '');

    if (!isNaN(start) && !isNaN(end)) {
      const attemptHighlight = () => {
        const container = document.querySelector('.theme-doc-markdown');
        if (!container || !container.textContent) {
          setTimeout(attemptHighlight, 100);
          return;
        }

        const found = findAndHighlightText(container, '', start, end);
        if (found) {
          setIsVisible(true);
        }
      };

      attemptHighlight();
    }
  }, [location.search, findAndHighlightText, setIsVisible]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]); // Scroll when new comments are added

  // Cancel fade when user interacts
  const cancelFade = useCallback(() => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }
    setIsFaded(false);
  }, []);

  const handleQuoteClick = useCallback((comment: Comment) => {
    const container = document.querySelector('.theme-doc-markdown');
    if (!container) return;

    clearHighlights();
    
    // Only on mobile: fade -> scroll -> unfade sequence
    if (window.innerWidth <= 768) {
      // First fade out
      setIsFaded(true);
      
      // Then scroll after a short delay
      setTimeout(() => {
        findAndHighlightText(
          container,
          comment.selection.text,
          comment.selection.startOffset,
          comment.selection.endOffset
        );
        
        // Set timeout to unfade
        fadeTimeoutRef.current = setTimeout(() => {
          setIsFaded(false);
        }, 3000);
      }, 200); // Wait for fade before scrolling
    } else {
      // On desktop, just highlight and scroll
      findAndHighlightText(
        container,
        comment.selection.text,
        comment.selection.startOffset,
        comment.selection.endOffset
      );
    }
  }, [clearHighlights, findAndHighlightText]);

  // Add touch and scroll handlers to cancel fade
  useEffect(() => {
    const notesPanel = document.querySelector(`.${styles.commentsList}`);
    if (!notesPanel) return;

    const handleInteraction = () => cancelFade();

    notesPanel.addEventListener('touchstart', handleInteraction);
    notesPanel.addEventListener('scroll', handleInteraction);

    return () => {
      notesPanel.removeEventListener('touchstart', handleInteraction);
      notesPanel.removeEventListener('scroll', handleInteraction);
    };
  }, [cancelFade]);

  // Add to your button click handlers:
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent quote click when clicking buttons
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000); // Hide toast after 2 seconds
    });
  };

  // Update the comment rendering structure
  const renderComment = (comment: Comment) => (
    <motion.div 
      key={comment.id} 
      className={styles.commentItem}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className={styles.timestamp}>
        {comment.selection.text ? <Book size={12} /> : <User size={12} />}
        <span>{formatTimestamp(comment.timestamp)}</span>
      </div>

      <div className={styles.contentDiv}>
        {comment.selection.text && (
          <div 
            className={styles.highlightContent}
            onClick={() => handleQuoteClick(comment)}
          >
            {comment.selection.text}
          </div>
        )}
        {comment.text && (
          <div className={styles.commentText}>
            {comment.text}
          </div>
        )}
      </div>

      <div className={styles.actionButtons}>
        <div className={styles.leftActions}>
          <button 
            className={styles.optionButton}
            onClick={() => handleCopyQuote(comment)}
            aria-label="Copy"
          >
            {copiedId === comment.id ? <Check size={16} /> : <Copy size={16} />}
          </button>
          {comment.selection.text && (
            <a
              href={createQuoteLink(comment)}
              className={styles.optionButton}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open quote link"
            >
              <Link size={16} />
            </a>
          )}
        </div>
        <button 
          className={`${styles.optionButton} ${styles.deleteButton}`}
          onClick={() => handleDeleteComment(comment.id)}
          aria-label="Delete"
        >
          <Trash size={16} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Add overlay div for mobile */}
          <motion.div 
            className={styles.mobileOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (window.innerWidth <= 768) {
                setIsVisible(false);
                clearHighlights();
              }
            }}
          />
          <motion.div 
            className={styles.commentsList}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isFaded ? 0.2 : 1, // Increased from 0.1 to 0.2
              y: 0 
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              opacity: { duration: 0.4 } // Slowed down from 0.2 to 0.4
            }}
          >
            <div className={styles.commentsHeader}>
              <div className={styles.headerLeft}>
                <span>Notes ({comments.length})</span>
                {comments.length > 0 && (
                  <button 
                    className={styles.clearAllButton}
                    onClick={clearAll}
                    aria-label="Clear all notes"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <button 
                className={styles.closeButton}
                onClick={handleCloseNotes}
                aria-label="Close notes"
              >
                ✕
              </button>
            </div>
            <div className={styles.commentsContainer}>
              {comments.map(renderComment)}
              <div ref={messagesEndRef} />
            </div>
            <div className={styles.inputContainer}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Add a note..."
                className={styles.messageInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button 
                className={styles.sendButton}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                aria-label="Send note"
              >
                <PaperPlaneRight 
                  size={20}
                  weight={newMessage.trim() ? "fill" : "regular"}
                />
              </button>
            </div>
          </motion.div>
          {showToast && <div className={styles.toast}>Copied to clipboard!</div>}
        </>
      )}
    </AnimatePresence>
  );
} 